import { Request, Response } from "express";
import User, { IUser } from "../models/User.js";
import Tenant from "../models/Tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";
import AuditLog from "../models/AuditLog.js";
import { toast } from "sonner";
import { notifyRoleChanged, notifyUserAddedToOrganization, notifyUserRemove, notifyTenantRemoved } from "../services/emailNotificationService.js";
import { createAppNotification } from "../services/notificationService.js";

export const formatRole = (role: string) => {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reqAny = (req: Request): Record<string, any> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req as unknown as Record<string, any>;

/** Get the authenticated user's tenant IDs from the request (set by loadTenant middleware). */
const reqTenantIds = (req: Request): string[] =>
  (reqAny(req).tenantIds as string[]) ?? [];

/** Check if user has access to a specific tenant. */
const hasTenantAccess = (req: Request, tenantId: string): boolean =>
  reqTenantIds(req).includes(tenantId);

/** Check if the authenticated user is the creator/owner of the tenant. */
const isTenantAdminOrCreator = async (
  req: Request,
  tenantId: string
): Promise<boolean> => {
  const userId = (req as any).user?._id;
  if (!userId) return false;

  // creator check
  const tenant = await Tenant.findById(tenantId).select("createdBy").lean();
  const isCreator = tenant && String(tenant.createdBy) === String(userId);

  // admin check
  const membership = await UserTenantRole.findOne({
    userId,
    tenantId,
    status: "active",
  });

  const isAdmin = membership?.role === "admin";

  return isCreator || isAdmin;
};

// ── Controllers ──────────────────────────────────────────────────────

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Return ALL users in the system so admins can search and invite them
    const users = await User.find().select("username email role").lean();
    res.status(200).json(users);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const getAllTenants = async (req: Request, res: Response) => {
  try {
    // Return only the active tenant (the one the user has currently switched to).
    // If in system context (no active tenant), return all tenants the user belongs to
    // so the dropdown can still be populated.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeTenantId = (req as any).activeTenantId as string | null;
    const tenantIds = reqTenantIds(req);

    if (tenantIds.length === 0) {
      res.status(200).json([]);
      return;
    }

    // For the role-management / org admin page, scope to active tenant only
    // so a user only manages the org they're currently acting in.
    const idsToFetch = activeTenantId ? [activeTenantId] : tenantIds;
    const tenants = await Tenant.find({ _id: { $in: idsToFetch } });
    res.status(200).json(tenants);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const addUserToOrganization = async (req: Request, res: Response) => {
  try {
    const { userId, tenantId } = req.params;
    const { role } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actor = (req as any).user;

    // Only the tenant creator can add users
    if (!(await isTenantAdminOrCreator(req, tenantId))) {
      return res.status(403).json({
        message: "Forbidden: only admin or creator can add users",
      });
    }

    const exists = await UserTenantRole.findOne({
      userId,
      tenantId,
      status: "active",
    });

    if (exists) {
      return res.status(400).json({
        message: "User already assigned to this tenant",
      });
    }

    const record = await UserTenantRole.create({
      userId,
      tenantId,
      role,
    });



    //Fetch user details
    const user = await User.findById(userId).lean<IUser>();
    const tenant = await Tenant.findById(tenantId).lean();

    if (user && tenant) {
      await notifyUserAddedToOrganization({
        email: user.email,
        username: user.username,
        organizationName: tenant.name,
        role,
      });
    }

    //In-app notification for User (NEW)
    await createAppNotification({
      tenant_id: tenantId,
      user_id: userId,
      type: "USER_ADDED",
      channel: "in_app",
      message: `You have been added to "${tenant?.name}" with role "${formatRole(role)}".`,
    });

    //In-app notification for Actor (NEW)
    await createAppNotification({
      tenant_id: tenantId,
      user_id: actor,
      type: "USER_ADDED",
      channel: "in_app",
      message: `You added ${user?.username} to the Organization "${tenant?.name}" with role "${formatRole(role)}".`,
    });

    await AuditLog.create({
      tenant_id: tenantId,
      user_id: actor._id,
      action: "add",
      entity: "User",
      entity_id: userId,
      description: `Added User ${user?.username} to ${tenant?.name}`,
    });

    res.status(201).json(record);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const getUserTenantData = async (req: Request, res: Response) => {
  try {
    const tenantIds = reqTenantIds(req);
    if (tenantIds.length === 0) {
      res.status(200).json([]);
      return;
    }

    const data = await UserTenantRole.find({
      tenantId: { $in: tenantIds },
      status: "active",
    })
      .populate("userId", "username email")
      .populate("tenantId", "name");

    res.status(200).json(data);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const updateOrgRole = async (req: Request, res: Response) => {
  try {
    const { userId, tenantId } = req.params;
    const { role: newRole } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actor = (req as any).user;

    if (!hasTenantAccess(req, tenantId)) {
      return res
        .status(403)
        .json({ message: "Forbidden: you do not belong to this tenant" });
    }

    // Only the tenant creator can change roles
    if (!(await isTenantAdminOrCreator(req, tenantId))) {
      return res.status(403).json({
        message: "Forbidden: only admin or creator can change roles",
      });
    }

    // 1. Get existing record FIRST (old role)
    const existing = await UserTenantRole.findOne({
      userId,
      tenantId,
      status: "active",
    });

    if (!existing) {
      return res.status(404).json({ message: "Record not found" });
    }

    const oldRole = existing.role;

    // 2. Update role
    existing.role = newRole;
    const updated = await existing.save();

    // 3. Populate for response
    await updated.populate("userId", "username email");
    await updated.populate("tenantId", "name");

    // 4. Fetch user/tenant for audit
    const user = await User.findById(userId);
    const tenant = await Tenant.findById(tenantId);

    if (user && tenant) {
      await notifyRoleChanged ({
        email: user?.email,
        organizationName: tenant?.name,
        username: user?.username,
        newRole: newRole,
      })
    }

    // 5. Audit log
    await AuditLog.create({
      tenant_id: tenantId,
      user_id: actor._id,
      action: "update",
      entity: "User",
      entity_id: userId,
      description: `Role changed from ${formatRole(oldRole)} to ${formatRole(newRole)} for ${user?.username} in Organization ${tenant?.name}`,
    });

    // await createAppNotification({
    //   tenant_id: tenantId,
    //   user_id: userId,
    //   message: `Your role was changed to ${formatRole(newRole)} in ${tenant?.name}`,
    //   type: "email",
    // });

    return res.status(200).json({
      updated,
      oldRole,
      newRole,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const removeOrgUser = async (req: Request, res: Response) => {
  try {
    const { userId, tenantId } = req.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actor = (req as any).user;

    if (!hasTenantAccess(req, tenantId)) {
      return res
        .status(403)
        .json({ message: "Forbidden: you do not belong to this tenant" });
    }

    // Only the tenant creator can remove users
    if (!(await isTenantAdminOrCreator(req, tenantId))) {
      return res.status(403).json({
        message: "Forbidden: only admin or creator can remove users",
      });
    }

    const record = await UserTenantRole.findOne({
      userId,
      tenantId,
      status: "active",
    });

    if (!record) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    record.status = "inactive";
    await record.save();

    const user = await User.findById(userId);
    const tenant = await Tenant.findById(tenantId);

    if(user && tenant){
      await notifyUserRemove({
        email: user.email,
        username: user.username,
        organizationName: tenant.name,
      })
    }

    await AuditLog.create({
      tenant_id: tenantId,
      user_id: actor._id,
      action: "delete",
      entity: "User",
      entity_id: userId,
      description: `Deleted ${user?.username} from Organization ${tenant?.name}`,
    });

    res.status(200).json({
      message: "User removed from organization",
    });
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const removeTenant = async (req: Request, res: Response) => {
  const { tenantId } = req.params;

  try {
    const tenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { status: "inactive" },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Get all active users before deactivating
    const tenantUsers = await UserTenantRole.find({
      tenantId,
      status: "active",
    }).populate("userId", "email username");

    // 2. Deactivate all user-tenant relationships
    await UserTenantRole.updateMany(
      { tenantId },
      {
        $set: {
          status: "inactive",
        },
      }
    );

    // Notify all users in parallel (faster)
    await Promise.all(
      tenantUsers.map(async (member) => {
        const user = member.userId as any;

        if (!user?.email) return;

        return notifyTenantRemoved({
          email: user.email,
          username: user.username,
          organizationName: tenant.name,
        });
      })
    );

    return res.status(200).json({
      message: "Tenant and related users deactivated successfully",
      tenant,
    });

  } catch (error) {
    console.error("Error removing tenant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

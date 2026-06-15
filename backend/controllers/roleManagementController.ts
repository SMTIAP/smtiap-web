import { Request, Response } from "express";
import User, { IUser } from "../models/User.js";
import Tenant from "../models/Tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";
import AuditLog from "../models/AuditLog.js";
import { Payment } from "../models/Payment.js";
import { toast } from "sonner";
import {
  notifyRoleChanged,
  notifyUserAddedToOrganization,
  notifyUserRemove,
  notifyTenantRemoved,
} from "../services/emailNotificationService.js";
import { createAppNotification } from "../services/notificationService.js";

// Converts a snake_case role string to Title Case for display
export const formatRole = (role: string) => {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};


const reqAny = (req: Request): Record<string, any> =>

  req as unknown as Record<string, any>;


const reqTenantIds = (req: Request): string[] =>
  (reqAny(req).tenantIds as string[]) ?? [];

// Check if user has access to a specific tenant.
const hasTenantAccess = (req: Request, tenantId: string): boolean =>
  reqTenantIds(req).includes(tenantId);

// Check if the authenticated user is the creator/owner of the tenant.
const isTenantAdminOrCreator = async (
  req: Request,
  tenantId: string,
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

// ---plan-based member ability limits, payment related---
// limit how many members one can add to their organization
//depending on their payment plan
// null means unlimited (for the pro plan)
const PLAN_MEMBER_LIMITS: Record<string, number | null> = {
  free: 1,
  startup: 2,
  pro: 10,
};

// resolve the tenant's current active plan, defaulting to "free" if none/expired.
const getTenantPlanName = async (tenantId: string): Promise<string> => {
  const payment = await Payment.findOne({ tenantId, status: "success" })
    .sort({ createdAt: -1 })
    .lean();

  if (!payment) return "free";
  if (payment.expiresAt && new Date(payment.expiresAt) < new Date())
    return "free";

  return payment.planName.toLowerCase();
};

// ── Controllers ──────────────────────────────────────────────────────

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Return ALL users in the system so admins can search and invite them
    // .lean() return plain javascrip object
    const users = await User.find().select("username email role").lean();
    res.status(200).json(users);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

// Returns tenants accessible to the user. If an activeTenantId is set, scopes to that single tenant.
export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const activeTenantId = (req as any).activeTenantId as string | null;
    const tenantIds = reqTenantIds(req);

    if (tenantIds.length === 0) {
      res.status(200).json([]);
      return;
    }

    const idsToFetch = activeTenantId ? [activeTenantId] : tenantIds;
    const tenants = await Tenant.find({ _id: { $in: idsToFetch } });
    res.status(200).json(tenants);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

// Adds a user to an organization with a specific role, enforcing plan-based member limits.
export const addUserToOrganization = async (req: Request, res: Response) => {
  try {
    const { userId, tenantId } = req.params;
    const { role } = req.body;
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

    // ---Enforce plan-based member limits--
    const planName = await getTenantPlanName(tenantId);
    const memberLimit = PLAN_MEMBER_LIMITS[planName] ?? 1;

    if (memberLimit !== null) {
      const currentMemberCount = await UserTenantRole.countDocuments({
        tenantId,
        status: "active",
      });

      if (currentMemberCount >= memberLimit) {
        return res.status(403).json({
          message:
            planName === "free"
              ? "Your organization is on the Free plan, which only supports 1 member (you). Upgrade your plan to add more members."
              : `Your organization is on the ${formatRole(planName)} plan, which supports up to ${memberLimit} members. Upgrade to Pro for unlimited members.`,
        });
      }
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

    // In-app notification for the added user.
    await createAppNotification({
      tenant_id: tenantId,
      user_id: userId,
      type: "USER_ADDED",
      channel: "in_app",
      message: `You have been added to "${tenant?.name}" with role "${formatRole(role)}".`,
    });

    // In-app notification for the actor who performed the addition.
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
      description: `Added User ${user?.username} to ${tenant?.name} with role "${formatRole(role)}"`,
    });

    res.status(201).json(record);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

// Returns all active members across the user's tenants with their roles.
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

// Updates a user's role within an organization. Only the tenant admin or creator can perform this action.
export const updateOrgRole = async (req: Request, res: Response) => {
  try {
    const { userId, tenantId } = req.params;
    const { role: newRole } = req.body;

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
      await notifyRoleChanged({
        email: user?.email,
        organizationName: tenant?.name,
        username: user?.username,
        newRole: newRole,
      });
    }

    //Audit log
    await AuditLog.create({
      tenant_id: tenantId,
      user_id: actor._id,
      action: "update",
      entity: "User",
      entity_id: userId,
      description: `Role changed from ${formatRole(oldRole)} to ${formatRole(newRole)} for ${user?.username} in Organization ${tenant?.name}`,
    });

    // In-app notification for the affected user.
    await createAppNotification({
      tenant_id: tenantId,
      user_id: userId,
      type: "ROLE_CHANGED",
      channel: "in_app",
      message: `Your role was changed to ${formatRole(newRole)} in ${tenant?.name}`,
    });

    // In-app notification for the actor who changed the role.
    await createAppNotification({
      tenant_id: tenantId,
      user_id: actor,
      type: "ROLE_CHANGED",
      channel: "in_app",
      message: `Change of role from ${formatRole(oldRole)} to ${formatRole(newRole)} in ${tenant?.name} for ${user?.username} in the Organization ${tenant?.name} was successful`,
    });

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

// Soft-deactivates a user's membership in an organization (sets status to inactive).
export const removeOrgUser = async (req: Request, res: Response) => {
  try {
    const { userId, tenantId } = req.params;
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

    if (user && tenant) {
      await notifyUserRemove({
        email: user.email,
        username: user.username,
        organizationName: tenant.name,
      });
    }

    // In-app notification for the removed user.
    await createAppNotification({
      tenant_id: tenantId,
      user_id: userId,
      type: "USER_REMOVED",
      channel: "in_app",
      message: `You have been removed from the Organization ${tenant?.name}`,
    });

    // In-app notification for the actor who performed the removal.
    await createAppNotification({
      tenant_id: tenantId,
      user_id: actor,
      type: "USER_REMOVED",
      channel: "in_app",
      message: `Successfully removed ${user?.username} from organization ${tenant?.name}`,
    });

    await AuditLog.create({
      tenant_id: tenantId,
      user_id: actor._id,
      action: "delete",
      entity: "User",
      entity_id: userId,
      description: `Removed ${user?.username} from Organization ${tenant?.name}`,
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

// Soft-deactivates an entire organization and all its memberships. Notifies all affected users.
export const removeTenant = async (req: Request, res: Response) => {
  const { tenantId } = req.params;
  const actor = (req as any).user;

  try {
    const tenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { status: "inactive" },
      { new: true },
    );

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const actorId = actor?._id?.toString();

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
      },
    );

    // Actor notification
    if (actor) {
      await createAppNotification({
        tenant_id: tenantId,
        user_id: actor._id,
        type: "TENANT_DEACTIVATED",
        channel: "in_app",
        message: `Successfully deaactivated organization ${tenant?.name}`,
      });
    }

    if (actor?.email) {
      await notifyTenantRemoved({
        email: actor.email,
        username: actor.username,
        organizationName: tenant.name,
      });
    }

    // Notify all users in parallel (faster)
    await Promise.all(
      tenantUsers
        .filter((member) => member.userId?._id?.toString() !== actorId)
        .map(async (member) => {
          const user = member.userId as any;

          if (!user?.email) return;

          // Other users notification
          await createAppNotification({
            tenant_id: tenantId,
            user_id: user._id,
            type: "TENANT_DEACTIVATED",
            channel: "in_app",
            message: `Organization ${tenant.name} has been deactivated`,
          });

          return notifyTenantRemoved({
            email: user.email,
            username: user.username,
            organizationName: tenant.name,
          });
        }),
    );

    //Audit log
    await AuditLog.create({
      tenant_id: tenantId,
      user_id: actor._id,
      action: "delete",
      entity: "Tenant",
      entity_id: tenantId,
      description: `Deactivated Organization ${tenant?.name}`,
    });

    return res.status(200).json({
      message: "Tenant and related users deactivated successfully",
      tenant,
    });
  } catch (error) {
    console.error("Error removing tenant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

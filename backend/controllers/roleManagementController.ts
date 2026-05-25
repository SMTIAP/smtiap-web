import { Request, Response } from "express";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";
import AuditLog from "../models/AuditLog.js";

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
    const user = await User.findById(userId);
    const tenant = await Tenant.findById(tenantId);

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

    const data = await UserTenantRole.find({ tenantId: { $in: tenantIds } })
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

    // 1. Get existing record FIRST (old role)
    const existing = await UserTenantRole.findOne({
      userId,
      tenantId,
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

    // 5. Audit log
    await AuditLog.create({
      tenant_id: tenantId,
      user_id: actor._id,
      action: "update",
      entity: "User",
      entity_id: userId,
      description: `Role changed from ${formatRole(oldRole)} to ${formatRole(newRole)} for ${user?.username} in Organization ${tenant?.name}`,
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

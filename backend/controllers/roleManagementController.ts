import { Request, Response } from "express";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";

/** Get the authenticated user's tenant IDs from the request (set by loadTenant middleware). */
const reqTenantIds = (req: Request): string[] =>
  ((req as any).tenantIds as string[]) ?? [];

/** Check if user has access to a specific tenant. */
const hasTenantAccess = (req: Request, tenantId: string): boolean =>
  reqTenantIds(req).includes(tenantId);

// ── Controllers ──────────────────────────────────────────────────────

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Return ALL users in the system so admins can search and invite them
    const users = await User.find().select("username email role").lean();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const tenantIds = reqTenantIds(req);
    if (tenantIds.length === 0) {
      res.status(200).json([]);
      return;
    }
    const tenants = await Tenant.find({ _id: { $in: tenantIds } });
    res.status(200).json(tenants);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Only update roles for users within the same tenant
    const tenantIds = reqTenantIds(req);
    const membership = await UserTenantRole.findOne({
      userId,
      tenantId: { $in: tenantIds },
    });

    if (!membership) {
      return res
        .status(403)
        .json({ message: "Forbidden: user not in your tenant" });
    }

    // Update role only in UserTenantRole — do NOT touch User.role (that is a global role)
    const updated = await UserTenantRole.findOneAndUpdate(
      { userId, tenantId: membership.tenantId },
      { role },
      { new: true },
    );

    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addUserToOrganization = async (req: Request, res: Response) => {
  try {
    const { userId, tenantId } = req.params;
    const { role } = req.body;

    // Verify the requester belongs to this tenant
    if (!hasTenantAccess(req, tenantId)) {
      return res
        .status(403)
        .json({ message: "Forbidden: you do not belong to this tenant" });
    }

    const exists = await UserTenantRole.findOne({ userId, tenantId });

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

    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrgRole = async (req: Request, res: Response) => {
  try {
    const { userId, tenantId } = req.params;
    const { role } = req.body;

    if (!hasTenantAccess(req, tenantId)) {
      return res
        .status(403)
        .json({ message: "Forbidden: you do not belong to this tenant" });
    }

    const updated = await UserTenantRole.findOneAndUpdate(
      { userId, tenantId },
      { role },
      { returnDocument: "after" },
    )
      .populate("userId")
      .populate("tenantId");

    if (!updated) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeOrgUser = async (req: Request, res: Response) => {
  try {
    const { userId, tenantId } = req.params;

    if (!hasTenantAccess(req, tenantId)) {
      return res
        .status(403)
        .json({ message: "Forbidden: you do not belong to this tenant" });
    }

    const deleted = await UserTenantRole.findOneAndDelete({
      userId,
      tenantId,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    res.status(200).json({
      message: "User removed from organization",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

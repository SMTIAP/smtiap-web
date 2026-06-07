import { Request, Response } from "express";
import Tenant from "../models/Tenant.js";
import { IUser } from "../models/User.js";
import UserTenantRole from "../models/UserTenantRole.js";
import Audit from "../models/AuditLog.js";

interface AuthRequest extends Request {
  user?: IUser;
}

const reqAny = (req: Request): Record<string, any> =>
  req as unknown as Record<string, any>;

const reqTenantIds = (req: Request): string[] =>
  (reqAny(req).tenantIds as string[]) ?? [];

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


export const getUserTenantData = async (req: Request, res: Response) => {
  try {
    const tenantIds = reqTenantIds(req);

    if (tenantIds.length === 0) {
      return res.status(200).json([]);
    }

    // 1. Get tenant users
    const userTenantRoles = await UserTenantRole.find({
      tenantId: { $in: tenantIds },
      status: "active",
    })
      .populate("userId", "username email")
      .populate("tenantId", "name");

    // 2. Extract user IDs
    const userIds = userTenantRoles.map(u => u.userId._id);

    // 3. Get last login ONLY for those users
    const lastLogins = await Audit.aggregate([
      {
        $match: {
          action: "LOGIN",
          userId: { $in: userIds }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          lastLogin: { $first: "$createdAt" }
        }
      }
    ]);

    const loginMap = new Map(
      lastLogins.map(l => [l._id.toString(), l.lastLogin])
    );

    // 4. Merge into response
    const result = userTenantRoles.map(u => {
      const obj = u.toObject();
      return {
        ...obj,
        lastLogin: loginMap.get(u.userId._id.toString()) || null
      };
    });

    return res.status(200).json(result);

  } catch (error: unknown) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};
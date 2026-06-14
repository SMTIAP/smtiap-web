import { Request, Response } from "express";
import Tenant from "../models/Tenant.js";
import { IUser } from "../models/User.js";
import UserTenantRole from "../models/UserTenantRole.js";
import Audit from "../models/AuditLog.js";
import mongoose from "mongoose";
import Survey from "../models/Survey.js";

interface AuthRequest extends Request {
  user?: IUser;
}

// Type-safe accessors for properties attached by middleware (loadTenant, enforceTenantAccess).
const reqAny = (req: Request): Record<string, any> =>
  req as unknown as Record<string, any>;

const reqTenantIds = (req: Request): string[] =>
  (reqAny(req).tenantIds as string[]) ?? [];

const reqSurveyIds = (req: Request): string[] =>
  (reqAny(req).surveyIds as string[]) ?? [];

// Returns tenants the user has access to. If an activeTenantId is set, restricts to that single tenant.
export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const activeTenantId = (req as any).activeTenantId as string | null;
    const tenantIds = reqTenantIds(req);

    if (tenantIds.length === 0) {
      res.status(200).json([]);
      return;
    }

    // When viewing a specific org context, only return that tenant.
    const idsToFetch = activeTenantId ? [activeTenantId] : tenantIds;
    const tenants = await Tenant.find({ _id: { $in: idsToFetch } });
    res.status(200).json(tenants);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

// Fetches all active users across the user's tenants, enriched with their last login timestamp.
export const getUserTenantData = async (req: Request, res: Response) => {
  try {
    const tenantIds = (req as any).tenantIds ?? [];

    if (tenantIds.length === 0) {
      return res.status(200).json({
        users: [],
        auditLogs: [],
      });
    }

    // 1. Get users
    const userTenantRoles = await UserTenantRole.find({
      tenantId: { $in: tenantIds },
      status: "active",
    })
      .populate("userId", "username email")
      .populate("tenantId", "name")
      .lean();

    // 2. Get audit logs (latest login per user)
    const auditLogs = await Audit.aggregate([
      { $match: { action: "login" } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$user_id",
          lastLogin: { $first: "$createdAt" },
        },
      },
    ]);
    console.log("🔥 RAW AUDIT AGGREGATION RESULT:", auditLogs);

    // 3. Convert to lookup map
    const loginMap = new Map(
      auditLogs.map((log) => [String(log._id), log.lastLogin]),
    );

    // 4. Merge lastLogin into users
    const mergedUsers = userTenantRoles.map((u: any) => ({
      ...u,
      lastLogin: loginMap.get(String(u.userId._id)) || null,
    }));
    console.log("USER IDS:");
    console.log(userTenantRoles.map((u) => String(u.userId._id)));

    console.log("AUDIT IDS:");
    console.log(auditLogs.map((a) => String(a._id)));
    return res.status(200).json({
      users: mergedUsers,
      auditLogs,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Aggregates survey stats (drafts, published, stopped) grouped by tenant for the admin dashboard.
export const getTenantActivity = async (req: Request, res: Response) => {
  try {
    const surveyIds = (req as any).surveyIds ?? [];
    const tenantIds = (req as any).tenantIds ?? [];

    const userCounts = await UserTenantRole.aggregate([
      {
        $match: {
          tenantId: {
            $in: tenantIds.map((id: string) => new mongoose.Types.ObjectId(id)),
          },
          status: "active",
        },
      },
      {
        $group: {
          _id: "$tenantId",
          totalUsers: { $sum: 1 },
        },
      },
    ]);

    const userCountMap = new Map(
      userCounts.map((u) => [String(u._id), u.totalUsers]),
    );

    if (tenantIds.length === 0) {
      return res.status(200).json([]);
    }

    // 1. Fetch tenants (for names)
    const tenants = await Tenant.find({
      _id: { $in: tenantIds },
    })

      .select("_id name status")
      .lean();

    const tenantMap = new Map(tenants.map((t) => [String(t._id), t]));
    // Get surveys for those tenants
    const surveys = await Survey.find({
      tenantId: { $in: tenantIds },
    }).lean();

    // Group analytics per tenant
    const activityMap = new Map();

    for (const survey of surveys) {
      const tenantId = String(survey.tenantId);

      if (!activityMap.has(tenantId)) {
        const tenantInfo = tenantMap.get(tenantId);

        activityMap.set(tenantId, {
          tenantId,

          tenantName: tenantInfo?.name ?? "Unknown",
          users: 0,

          totalSurveys: 0,
          drafts: 0,
          scheduled: 0,
          published: 0,
          stopped: 0,
          responses: 0,
          status: tenantInfo?.status ?? "Unknown",
        });
      }

      const item = activityMap.get(tenantId);

      item.totalSurveys++;

      // status breakdown (adjust based on your schema)
      if (survey.status === "Draft") item.drafts++;
      if (survey.status === "Scheduled") item.scheduled++;
      if (survey.status === "Running") item.published++;
      if (survey.status === "Finished") item.stopped++;

      // if you have responses field
      // item.responses += survey.responsesCount || 0;
    }

    return res.status(200).json(Array.from(activityMap.values()));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

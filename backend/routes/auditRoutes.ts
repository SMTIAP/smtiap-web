import { Router, Request, Response } from "express";
import AuditLog from "../models/AuditLog.js";
import TenantUser from "../models/TenantUser.js";
import Tenant from "../models/Tenant.js";
import { protect } from "../middleware/auth.js";
import { loadTenant } from "../middleware/tenant.js";

const router = Router();

// Get all audit logs with filters (scoped to user's tenant)
router.get("/", protect, loadTenant, async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, action, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const currentUser = (req as any).user;
    const tenantIds = ((req as any).tenantIds as string[]) ?? [];

    // Restrict logs to the user's own actions within their tenant(s)
    const filter: Record<string, unknown> = {
      user_id: currentUser?._id,
    };

    // Also scope by tenant if user has memberships
    if (tenantIds.length > 0) {
      filter.tenant_id = { $in: tenantIds };
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        (filter.createdAt as Record<string, unknown>).$gte = new Date(
          fromDate as string,
        );
      }
      if (toDate) {
        const toDateObj = new Date(toDate as string);
        toDateObj.setHours(23, 59, 59, 999);
        (filter.createdAt as Record<string, unknown>).$lte = toDateObj;
      }
    }

    if (action) {
      filter.action = action;
    }

    // Get total count
    const totalCount = await AuditLog.countDocuments(filter);

    // Get paginated results with user and tenant info
    const logs = await AuditLog.find(filter)
      .populate("user_id", "username email")
      .populate("tenant_id", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: (error as Error).message,
    });
  }
});

// Get distinct values for filters
router.get("/filters/options", protect, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as Request & { user?: { _id: unknown } }).user;
    const userId = currentUser?._id;

    const actions = await AuditLog.distinct("action", {
      user_id: userId,
    } as any);

    res.json({
      success: true,
      data: {
        actions,
        users: [],
      },
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch filter options",
      error: (error as Error).message,
    });
  }
});

// Get all tenant users
router.get("/tenant-users", protect, async (req: Request, res: Response) => {
  try {
    const tenantUsers = await TenantUser.find()
      .populate("tenant_id", "name")
      .lean();

    res.json({
      success: true,
      data: tenantUsers,
    });
  } catch (error) {
    console.error("Error fetching tenant users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenant users",
      error: (error as Error).message,
    });
  }
});

// Seed sample audit logs (for development)
router.post("/seed", protect, async (req: Request, res: Response) => {
  try {
    // Check if logs already exist
    const existingLogs = await AuditLog.countDocuments();
    if (existingLogs > 0) {
      return res.json({
        success: false,
        message: "Audit logs already exist in database",
        count: existingLogs,
      });
    }

    // Get or create test tenant
    let tenant = await Tenant.findOne();
    if (!tenant) {
      tenant = await Tenant.create({
        name: "Test Organization",
        email: "test@org.com",
        status: "active",
      });
    }

    // Get or create test tenant users
    let user1 = await TenantUser.findOne({ tenant_id: tenant._id } as any);
    if (!user1) {
      user1 = await TenantUser.create({
        tenant_id: tenant._id,
        email: "user1@test.com",
        password_hash: "hashed_password",
        name: "Kamal Perera",
        role: "admin",
      } as any);
    }

    let user2 = await TenantUser.findOne({
      tenant_id: tenant._id,
      name: "Namal Kumara",
    } as any);
    if (!user2) {
      user2 = await TenantUser.create({
        tenant_id: tenant._id,
        email: "user2@test.com",
        password_hash: "hashed_password",
        name: "Namal Kumara",
        role: "editor",
      } as any);
    }

    // Create sample audit logs
    const sampleLogs = [
      {
        tenant_id: tenant._id,
        user_id: user1._id,
        action: "login",
        entity: "User",
        entity_id: user1._id,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        tenant_id: tenant._id,
        user_id: user2._id,
        action: "login",
        entity: "User",
        entity_id: user2._id,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        tenant_id: tenant._id,
        user_id: user1._id,
        action: "create",
        entity: "Survey",
        entity_id: new (require("mongoose").Types.ObjectId)(),
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        tenant_id: tenant._id,
        user_id: user1._id,
        action: "update",
        entity: "Survey",
        entity_id: new (require("mongoose").Types.ObjectId)(),
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        tenant_id: tenant._id,
        user_id: user2._id,
        action: "logout",
        entity: "User",
        entity_id: user2._id,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
    ];

    const created = await AuditLog.insertMany(sampleLogs);

    res.json({
      success: true,
      message: "Sample audit logs created successfully",
      count: created.length,
      data: created,
    });
  } catch (error) {
    console.error("Error seeding audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed audit logs",
      error: (error as Error).message,
    });
  }
});

export default router;

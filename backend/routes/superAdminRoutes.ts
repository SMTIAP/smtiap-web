import express from "express";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import AuditLog from "../models/AuditLog.js";
import {
  superAdminLogin,
  getSuperAdminDashboard,
  getManagedUsers,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
  getManagedTenants,
  updateManagedTenant,
  adjustTenantCredits,
} from "../controllers/superAdminController.js";

const router = express.Router();

router.post("/login", superAdminLogin);
router.get(
  "/dashboard",
  protect,
  authorizeRoles("super_admin"),
  getSuperAdminDashboard,
);
router.get(
  "/users",
  protect,
  authorizeRoles("super_admin"),
  getManagedUsers,
);
router.post(
  "/users",
  protect,
  authorizeRoles("super_admin"),
  createManagedUser,
);
router.patch(
  "/users/:userId",
  protect,
  authorizeRoles("super_admin"),
  updateManagedUser,
);
router.delete(
  "/users/:userId",
  protect,
  authorizeRoles("super_admin"),
  deleteManagedUser,
);

// Tenant and organization controls
router.get(
  "/tenants",
  protect,
  authorizeRoles("super_admin"),
  getManagedTenants,
);
router.patch(
  "/tenants/:tenantId",
  protect,
  authorizeRoles("super_admin"),
  updateManagedTenant,
);
router.post(
  "/tenants/:tenantId/credits",
  protect,
  authorizeRoles("super_admin"),
  adjustTenantCredits,
);

// ============================================================
// SUPER ADMIN AUDIT ENDPOINTS
// ============================================================

// GET /api/super-admin/audit-logs - Super admin sees ALL platform logs
router.get(
  "/audit-logs",
  protect,
  authorizeRoles("super_admin"),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        fromDate,
        toDate,
        action,
        entity,
        tenantId,
      } = req.query;

      const pageNum = parseInt(String(page)) || 1;
      const limitNum = parseInt(String(limit)) || 20;
      const skip = (pageNum - 1) * limitNum;

      const filter: any = {};

      // Date filters
      if (fromDate || toDate) {
        filter.createdAt = {};
        if (fromDate) {
          filter.createdAt.$gte = new Date(String(fromDate));
        }
        if (toDate) {
          const toDateObj = new Date(String(toDate));
          toDateObj.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = toDateObj;
        }
      }

      // Action filter
      if (action) {
        filter.action = action;
      }

      // Entity filter
      if (entity) {
        filter.entity = entity;
      }

      // Tenant filter - super admin can filter by specific tenant
      if (tenantId && tenantId !== "__system__") {
        filter.tenant_id = tenantId;
      }
      if (tenantId === "__system__") {
        filter.tenant_id = null;
      }

      // Get total count
      const totalCount = await AuditLog.countDocuments(filter);

      // Get paginated results
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
    } catch (error: any) {
      console.error("Error fetching super admin audit logs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch audit logs",
        error: error.message,
      });
    }
  }
);

// GET /api/super-admin/audit-actions - Get all unique actions for filter
router.get(
  "/audit-actions",
  protect,
  authorizeRoles("super_admin"),
  async (req, res) => {
    try {
      const actions = await AuditLog.distinct("action");
      res.json({
        success: true,
        data: actions,
      });
    } catch (error: any) {
      console.error("Error fetching distinct actions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch actions",
        error: error.message,
      });
    }
  }
);

// GET /api/super-admin/audit-entities - Get all unique entities for filter
router.get(
  "/audit-entities",
  protect,
  authorizeRoles("super_admin"),
  async (req, res) => {
    try {
      const entities = await AuditLog.distinct("entity");
      res.json({
        success: true,
        data: entities,
      });
    } catch (error: any) {
      console.error("Error fetching distinct entities:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch entities",
        error: error.message,
      });
    }
  }
);

export default router;
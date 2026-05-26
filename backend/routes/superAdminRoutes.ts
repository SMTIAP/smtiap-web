import express from "express";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
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

export default router;

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { loadTenant } from "../middleware/tenant.js";
import {
  getAllTenants,
  getAllUsers,
  updateUserRole,
  addUserToOrganization,
  getUserTenantData,
  updateOrgRole,
  removeOrgUser,
} from "../controllers/roleManagementController.js";

const router = Router();

// All role management routes require authentication + tenant context
router.get("/", protect, loadTenant, getAllUsers);
router.put("/:userId/role", protect, loadTenant, updateUserRole);
router.get("/tenants", protect, loadTenant, getAllTenants);
router.put("/:userId/:tenantId", protect, loadTenant, addUserToOrganization);
router.put("/:userId/:tenantId/role", protect, loadTenant, updateOrgRole);
router.get("/user-tenant", protect, loadTenant, getUserTenantData);
router.delete("/:userId/:tenantId", protect, loadTenant, removeOrgUser);

export default router;

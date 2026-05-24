import { Router } from "express";
import { getAllTenants, getAllUsers, 
// updateUserRole, 
addUserToOrganization, getUserTenantData, updateOrgRole, removeOrgUser } from "../controllers/roleManagementController.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", getAllUsers);
// router.put("/:userId/role", updateUserRole)
router.get("/tenants", getAllTenants);
router.put("/:userId/:tenantId", protect, addUserToOrganization);
router.put("/:userId/:tenantId/role", protect, updateOrgRole);
router.get("/user-tenant", getUserTenantData);
router.patch("/:userId/:tenantId/remove", protect, removeOrgUser);
// router.get("/tenants/:userId/tenantId/role");

export default router;
import { Router } from "express";
import { getAllTenants, getAllUsers, updateUserRole, addUserToOrganization, getUserTenantData, updateOrgRole, removeOrgUser, deleteUser } from "../controllers/roleManagementController.js";
import User from "../models/User.js";

const router = Router();

router.get("/", getAllUsers);
router.put("/:userId/role", updateUserRole)
router.get("/tenants", getAllTenants);
router.put("/:userId/:tenantId", addUserToOrganization);
router.put("/:userId/:tenantId/role", updateOrgRole);
router.get("/user-tenant", getUserTenantData);
router.delete("/:userId/:tenantId", removeOrgUser);
router.delete("/:userId", deleteUser);

export default router;
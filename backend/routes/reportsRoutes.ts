import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { loadTenant } from "../middleware/tenant.js";
import { getAllTenants } from "../controllers/reportsController.js";
import { getUserTenantData } from "../controllers/roleManagementController.js";

const router = Router();

router.get("/tenants/my", protect, loadTenant, getAllTenants);
router.get("/user-tenant", protect, loadTenant, getUserTenantData);

export default router;
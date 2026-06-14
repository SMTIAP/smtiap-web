import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { loadTenant } from "../middleware/tenant.js";
import { getAllTenants, getUserTenantData, getTenantActivity } from "../controllers/reportsController.js";


const router = Router();

router.get("/tenants/my", protect, loadTenant, getAllTenants);
router.get("/user-tenant", protect, loadTenant, getUserTenantData);
router.get("/tenant-activity", protect, loadTenant, getTenantActivity);

export default router;
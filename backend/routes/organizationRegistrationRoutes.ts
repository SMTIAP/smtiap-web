// Organization registration route: creates a new tenant with the authenticated user as admin.
import { Router } from "express";
import { createOrganization } from "../controllers/organizationRegistrationController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, createOrganization);
export default router;

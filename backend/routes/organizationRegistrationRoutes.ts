import { Router } from "express";
import { createOrganization } from "../controllers/organizationRegistrationController.js";

const router = Router();

router.post("/organization-registration", createOrganization);
export default router;
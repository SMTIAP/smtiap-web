import { Router } from "express";
import {
  createPayHereHash,
  handlePayHereNotify,
  getTenantSubscription,
} from "../controllers/payhereController.js";
import { protect } from "../middleware/auth.js";
import { loadTenant } from "../middleware/tenant.js";

const router = Router();

//requires a logged-in user and a valid x-tenant-id header (validated by loadTenant)
router.get("/payments/subscription", protect, loadTenant, getTenantSubscription);
router.post("/payments/generate-hash", protect, loadTenant, createPayHereHash);

//payHere calls this directly. no user session, so no auth middleman here.
//identity/tenant comes from custom_1/custom_2/custom_3 + signature verification.
router.post("/payhere-notify", handlePayHereNotify);

export default router;
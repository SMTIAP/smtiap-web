// Payment routes: generate PayHere hash, handle callbacks, and check subscription status.
import { Router } from "express";
import {
  createPayHereHash,
  handlePayHereNotify,
  getTenantSubscription,
} from "../controllers/payhereController.js";
import { protect } from "../middleware/auth.js"; //to verify the JWT json web token
import { loadTenant } from "../middleware/tenant.js"; //look up user's tenant role

const router = Router();

// Requires a logged-in user and a valid x-tenant-id header (validated by loadTenant).
router.get(
  "/payments/subscription",
  protect,
  loadTenant,
  getTenantSubscription,
);
router.post("/payments/generate-hash", protect, loadTenant, createPayHereHash);

// PayHere calls this directly. No user session or auth middleware.
// Tenant identity comes from custom fields + signature verification in the controller.
router.post("/payhere-notify", handlePayHereNotify);

export default router;

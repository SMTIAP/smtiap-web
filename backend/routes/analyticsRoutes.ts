import { Router } from "express";
import {
  getAnalyticsResults,
  saveAnalyticsResult,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/api/analytics", getAnalyticsResults);
router.post("/api/analytics", protect, saveAnalyticsResult);

export default router;

import { Router } from "express";
import {
  getAnalyticsResults,
  saveAnalyticsResult,
} from "../controllers/analyticsController.js";

const router = Router();

router.get("/api/analytics", getAnalyticsResults);
router.post("/api/analytics", saveAnalyticsResult);

export default router;

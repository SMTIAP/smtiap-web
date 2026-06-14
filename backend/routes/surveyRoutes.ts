// Survey routes: CRUD for surveys, public response submission, password verification.
import { Router, Request } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import {
  createSurvey,
  getSurveys,
  getSurveyById,
  updateSurvey,
  updateStatus,
  deleteSurvey,
} from "../controllers/surveyController.js";
import SurveyResponse from "../models/SurveyResponse.js";
import Survey from "../models/Survey.js";
import { protect } from "../middleware/auth.js";
import { loadTenant } from "../middleware/tenant.js";

const router = Router();

// Extracts the real client IP from proxy-forwarded headers, falling back to req.ip.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getClientIp = (req: any): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return String(req.ip || req.socket?.remoteAddress || "").trim();
};

// Generates a SHA-256 fingerprint from browser headers for duplicate detection.
const getDeviceHash = (req: any): string => {
  const userAgent = String(req.headers["user-agent"] || "");
  const acceptLanguage = String(req.headers["accept-language"] || "");
  const secChUa = String(req.headers["sec-ch-ua"] || "");
  const secChUaPlatform = String(req.headers["sec-ch-ua-platform"] || "");

  const rawFingerprint = [userAgent, acceptLanguage, secChUa, secChUaPlatform]
    .map((value) => value.trim())
    .join("|");

  if (!rawFingerprint.replace(/\|/g, "")) {
    return "";
  }

  return crypto.createHash("sha256").update(rawFingerprint).digest("hex");
};

// ── Survey Management (protected + tenant-scoped) ──
router.post("/", protect, loadTenant, createSurvey);
router.get("/", protect, loadTenant, getSurveys);
router.get("/:id", loadTenant, getSurveyById);
router.put("/:id", protect, loadTenant, updateSurvey);
router.patch("/:id/status", protect, loadTenant, updateStatus);
router.delete("/:id", protect, loadTenant, deleteSurvey);

// Verify survey password using bcrypt hash comparison.
router.post("/:id/verify-password", async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ error: "Survey not found" });
    if (!survey.isPasswordProtected) return res.json({ success: true });

    // Use bcrypt.compare to verify hashed password
    const isValid = await bcrypt.compare(req.body.password, survey.password);

    if (isValid) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Incorrect password" });
    }
  } catch {
    res.status(500).json({ error: "Failed to verify password" });
  }
});

// Save a survey response (public endpoint, no auth required).
router.post("/:id/responses", async (req, res) => {
  try {
    const respondentToken = String(req.body?.respondentToken || "").trim();
    const ipAddress = getClientIp(req);
    const userAgent = String(req.headers["user-agent"] || "").trim();
    const deviceHash = getDeviceHash(req);

    if (!respondentToken) {
      return res.status(400).json({ error: "Respondent token is required" });
    }

    // Lookup the survey's tenantId to isolate this response
    const survey = await Survey.findById(req.params.id)
      .select("tenantId")
      .lean();

    const duplicateFilters: Record<string, unknown>[] = [{ respondentToken }];
    if (ipAddress) {
      duplicateFilters.push({ ipAddress });
    }
    if (deviceHash) {
      duplicateFilters.push({ deviceHash });
    }

    // Duplicate check is disabled — keeping the query for future use
    await SurveyResponse.findOne({
      surveyId: req.params.id,
      $or: duplicateFilters,
    });

    //if (existingCheck) {
    //   return res.status(409).json({
    //    error: "You have already submitted a response for this survey.",
    //  });
    // }

    const doc = await SurveyResponse.create({
      surveyId: req.params.id,
      tenantId: survey?.tenantId ?? null,
      respondentToken,
      ipAddress,
      userAgent,
      deviceHash,
      responses: req.body.responses,
    });
    res.json(doc);
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any)?.code === 11000) {
      return res.status(409).json({
        error: "You have already submitted a response for this survey.",
      });
    }
    res.status(500).json({ error: "Failed to save response" });
  }
});

// Get all responses for a survey (public endpoint).
router.get("/:id/responses", async (req, res) => {
  try {
    // Only return responses for this survey
    const docs = await SurveyResponse.find({ surveyId: req.params.id });
    res.json(docs);
  } catch {
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

export default router;

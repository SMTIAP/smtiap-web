import { Router } from "express";
import crypto from "crypto";
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
import { protect, optionalAuth } from "../middleware/auth.js";

const router = Router();

const getClientIp = (req: any): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return String(req.ip || req.socket?.remoteAddress || "").trim();
};

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

router.post("/", optionalAuth, createSurvey);
router.get("/", getSurveys);
router.get("/:id", getSurveyById);
router.put("/:id", optionalAuth, updateSurvey);
router.patch("/:id/status", protect, updateStatus);
router.delete("/:id", optionalAuth, deleteSurvey);

// ✅ Verify survey password
router.post("/:id/verify-password", async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ error: "Survey not found" });
    if (!survey.isPasswordProtected) return res.json({ success: true });
    if (survey.password === req.body.password) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Incorrect password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to verify password" });
  }
});

// Save a survey response
router.post("/:id/responses", async (req, res) => {
  try {
    const respondentToken = String(req.body?.respondentToken || "").trim();
    const ipAddress = getClientIp(req);
    const userAgent = String(req.headers["user-agent"] || "").trim();
    const deviceHash = getDeviceHash(req);

    if (!respondentToken) {
      return res.status(400).json({ error: "Respondent token is required" });
    }

    const duplicateFilters: any[] = [{ respondentToken }];
    if (ipAddress) {
      duplicateFilters.push({ ipAddress });
    }
    if (deviceHash) {
      duplicateFilters.push({ deviceHash });
    }

    const existing = await SurveyResponse.findOne({
      surveyId: req.params.id,
      $or: duplicateFilters,
    });

   //if (existing) {
   //   return res.status(409).json({
    //    error: "You have already submitted a response for this survey.",
   //  });
  // }

    const doc = await SurveyResponse.create({
      surveyId: req.params.id,
      respondentToken,
      ipAddress,
      userAgent,
      deviceHash,
      responses: req.body.responses,
    });
    res.json(doc);
  } catch (err) {
    if ((err as any)?.code === 11000) {
      return res.status(409).json({
        error: "You have already submitted a response for this survey.",
      });
    }
    res.status(500).json({ error: "Failed to save response" });
  }
});

// Get all responses for a survey
router.get("/:id/responses", async (req, res) => {
  try {
    const docs = await SurveyResponse.find({ surveyId: req.params.id });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

export default router;

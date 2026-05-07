import { Router } from "express";
import {
  createSurvey, getSurveys, getSurveyById,
  updateSurvey, updateStatus, deleteSurvey,
} from "../controllers/surveyController.js";
import SurveyResponse from "../models/SurveyResponse.js";
import Survey from "../models/Survey.js";

const router = Router();

router.post("/",            createSurvey);
router.get("/",             getSurveys);
router.get("/:id",          getSurveyById);
router.put("/:id",          updateSurvey);
router.patch("/:id/status", updateStatus);
router.delete("/:id",       deleteSurvey);

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
    const doc = await SurveyResponse.create({
      surveyId: req.params.id,
      responses: req.body.responses
    });
    res.json(doc);
  } catch (err) {
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
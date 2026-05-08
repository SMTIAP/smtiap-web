import { Router } from "express";
import {
  createSurvey, getSurveys, getSurveyById,
  updateSurvey, updateStatus, deleteSurvey,
} from "../controllers/surveyController.js";
import SurveyResponse from "../models/SurveyResponse.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/",             protect, createSurvey);
router.get("/",              protect, getSurveys);
router.get("/:id",           getSurveyById);
router.put("/:id",           protect, updateSurvey);
router.patch("/:id/status",  protect, updateStatus);
router.delete("/:id",        protect, deleteSurvey);

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
import { Router } from "express";
import {
  chatWithAi,
  generateSurveyWithAi,
  modifySurveyWithAi,
} from "../controllers/aiController.js";

const router = Router();

router.post("/chat", chatWithAi);
router.post("/generate-survey", generateSurveyWithAi);
router.post("/modify-survey", modifySurveyWithAi);

export default router;

import { Router } from "express";
import {
  createSurvey, getSurveys, getSurveyById,
  updateSurvey, updateStatus, deleteSurvey,
} from "../controllers/surveyController.js";

const router = Router();

router.post("/",             createSurvey);
router.get("/",              getSurveys);
router.get("/:id",           getSurveyById);
router.put("/:id",           updateSurvey);
router.patch("/:id/status",  updateStatus);
router.delete("/:id",        deleteSurvey);

export default router;
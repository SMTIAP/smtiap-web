import { Request, Response } from "express";
import Survey from "../models/Survey.js";

// POST /api/surveys — Create survey
export const createSurvey = async (req: Request, res: Response) => {
  try {
    const {
      surveyTitle, description, websiteUrl, logo, themeColor,
      customizeBranding, isAnonymous, questions, status, tenantId,
    } = req.body;

    if (!surveyTitle) {
      res.status(400).json({ message: "Survey title is required" });
      return;
    }

    if (!questions || questions.length === 0) {
      res.status(400).json({ message: "At least one question is required" });
      return;
    }

    const survey = new Survey({
      surveyTitle, description, websiteUrl, logo, themeColor,
      customizeBranding, isAnonymous, questions, status, tenantId,
    });

    await survey.save();
    res.status(201).json({ message: "Survey created", survey });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// GET /api/surveys — Get all surveys
export const getSurveys = async (req: Request, res: Response) => {
  try {
    const { tenantId, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (tenantId) filter.tenantId = tenantId;
    if (status) filter.status = status;

    const surveys = await Survey.find(filter).sort({ createdAt: -1 });
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// GET /api/surveys/:id — Get single survey
export const getSurveyById = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      res.status(404).json({ message: "Survey not found" });
      return;
    }
    res.json(survey);
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// PUT /api/surveys/:id — Update full survey
export const updateSurvey = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!survey) {
      res.status(404).json({ message: "Survey not found" });
      return;
    }
    res.json({ message: "Survey updated", survey });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// PATCH /api/surveys/:id/status — Update status only
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Draft", "Running", "Finished"];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!survey) {
      res.status(404).json({ message: "Survey not found" });
      return;
    }
    res.json({ message: "Status updated", survey });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// DELETE /api/surveys/:id — Delete survey
export const deleteSurvey = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);
    if (!survey) {
      res.status(404).json({ message: "Survey not found" });
      return;
    }
    res.json({ message: "Survey deleted" });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};
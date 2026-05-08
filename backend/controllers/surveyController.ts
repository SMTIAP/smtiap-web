import { Request, Response } from "express";
import Survey from "../models/Survey.js";
import AuditLog from "../models/AuditLog.js";

const logAudit = (req: Request, action: string, entityId: any) => {
  const user = (req as any).user;
  if (!user) return;
  AuditLog.create({
    user_id: user._id,
    action,
    entity: "Survey",
    entity_id: entityId,
  } as any).catch(() => {});
};

// POST /api/surveys
export const createSurvey = async (req: Request, res: Response) => {
  try {
    const {
      surveyTitle,
      description,
      websiteUrl,
      logo,
      themeColor,
      primaryColor,
      customizeBranding,
      isAnonymous,
      pages,
      status,
      tenantId,
    } = req.body;

    if (!surveyTitle) {
      res.status(400).json({ message: "Survey title is required" });
      return;
    }

    const creatorId = (req as any).user._id.toString();

    const survey = new Survey({
      surveyTitle,
      description,
      websiteUrl,
      logo,
      themeColor,
      primaryColor,
      customizeBranding,
      isAnonymous,
      pages,
      status,
      tenantId,
    });

    await survey.save();
    logAudit(req, "create", survey._id);
    res.status(201).json({ message: "Survey created", survey });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// GET /api/surveys
export const getSurveys = async (req: Request, res: Response) => {
  try {
    const { tenantId, status } = req.query;
    const creatorId = (req as any).user._id.toString();
    const filter: Record<string, unknown> = { creatorId };
    if (tenantId) filter.tenantId = tenantId;
    if (status) filter.status = status;

    const surveys = await Survey.find(filter).sort({ createdAt: -1 });
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// GET /api/surveys/:id
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

// PUT /api/surveys/:id
export const updateSurvey = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!survey) {
      res.status(404).json({ message: "Survey not found" });
      return;
    }
    logAudit(req, "update", survey._id);
    res.json({ message: "Survey updated", survey });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// PATCH /api/surveys/:id/status
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!["Draft", "Running", "Finished"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }
    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!survey) {
      res.status(404).json({ message: "Survey not found" });
      return;
    }
    logAudit(req, `status_change_${status.toLowerCase()}`, survey._id);
    res.json({ message: "Status updated", survey });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// DELETE /api/surveys/:id
export const deleteSurvey = async (req: Request, res: Response) => {
  try {
    const surveyId = req.params.id;
    await Survey.findByIdAndDelete(surveyId);
    logAudit(req, "delete", surveyId);
    res.json({ message: "Survey deleted" });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

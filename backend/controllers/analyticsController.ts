import type { Request, Response, NextFunction } from "express";
import AnalyticsResult from "../models/AnalyticsResult.js";
import AuditLog from "../models/AuditLog.js";
import Survey from "../models/Survey.js";

export const saveAnalyticsResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { surveyId, summary, topKeywords, sourceCount, totalResponses } =
      req.body as {
        surveyId?: string;
        summary?: string;
        topKeywords?: { keyword: string; count: number }[];
        sourceCount?: number;
        totalResponses?: number;
      };

    if (!surveyId || !summary || !Array.isArray(topKeywords)) {
      res.status(400).json({ error: "Invalid analytics payload" });
      return;
    }

    const normalizedTopKeywords = topKeywords
      .filter((item) => item && typeof item.keyword === "string")
      .map((item) => ({
        keyword: item.keyword.trim(),
        count: Number(item.count ?? 0),
      }))
      .slice(0, 5);

    const payload = {
      surveyId: surveyId.trim(),
      summary: summary.trim(),
      topKeywords: normalizedTopKeywords,
      sourceCount: Number(sourceCount ?? totalResponses ?? 0),
      total_responses: Number(totalResponses ?? sourceCount ?? 0),
      last_updated: new Date(),
    };

    const result = await AnalyticsResult.findOneAndUpdate(
      { surveyId: payload.surveyId },
      { $set: payload },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    try {
      const userId = (req as any).user?._id;

      if (userId) {
        
        const survey = await Survey.findById(surveyId).select("surveyTitle tenantId");
        // const tenantId = survey?.tenantId ?? null;

        await AuditLog.create({
          user_id: userId,
          tenant_id: survey?.tenantId,
          action: "ai-analysis-run",
          entity: "Survey",
          entity_id: surveyId,
          description: `Performed AI Analysis for Survey ${survey?.surveyTitle ?? surveyId}`,
        });
      }
    } catch (auditErr) {
      console.error("Audit log failed:", auditErr);
    }


    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getAnalyticsResults = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const surveyIdParam =
      typeof req.query.surveyId === "string" ? req.query.surveyId.trim() : "";

    if (!surveyIdParam) {
      res.status(400).json({ error: "surveyId query parameter is required" });
      return;
    }

    const result = await AnalyticsResult.findOne({ surveyId: surveyIdParam });
    res.json(result ? [result] : []);
  } catch (err) {
    next(err);
  }
};

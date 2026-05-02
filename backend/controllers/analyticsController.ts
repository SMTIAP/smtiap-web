import type { Request, Response, NextFunction } from "express";
import AnalyticsResult from "../models/AnalyticsResult.js";

export const saveAnalyticsResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { surveyId, summary, topKeywords, sourceCount } = req.body as {
      surveyId?: string;
      summary?: string;
      topKeywords?: { keyword: string; count: number }[];
      sourceCount?: number;
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
      sourceCount: Number(sourceCount ?? 0),
    };

    const existingBySurvey = await AnalyticsResult.findOne({
      surveyId: payload.surveyId,
    });

    if (existingBySurvey) {
      const updated = await AnalyticsResult.findByIdAndUpdate(
        existingBySurvey._id,
        payload,
        {
          returnDocument: "after",
          runValidators: true,
        },
      );
      res.json(updated);
      return;
    }

    const legacyWithoutSurvey = await AnalyticsResult.findOne({
      $or: [{ surveyId: { $exists: false } }, { surveyId: "" }],
    }).sort({ createdAt: -1 });

    if (legacyWithoutSurvey) {
      const migrated = await AnalyticsResult.findByIdAndUpdate(
        legacyWithoutSurvey._id,
        payload,
        {
          returnDocument: "after",
          runValidators: true,
        },
      );
      res.json(migrated);
      return;
    }

    try {
      const created = await AnalyticsResult.create(payload);
      res.status(201).json(created);
    } catch {
      const upserted = await AnalyticsResult.findOneAndUpdate(
        { surveyId: payload.surveyId },
        payload,
        {
          upsert: true,
          returnDocument: "after",
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );
      res.json(upserted);
    }
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

    const query = surveyIdParam ? { surveyId: surveyIdParam } : {};

    const results = await AnalyticsResult.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(results);
  } catch (err) {
    next(err);
  }
};

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const keywordSchema = new Schema(
  {
    keyword: { type: String, required: true, trim: true },
    count: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const analyticsResultSchema = new Schema(
  {
    surveyId: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    topKeywords: { type: [keywordSchema], required: true, default: [] },
    sourceCount: { type: Number, required: true, min: 0, default: 0 },
    total_responses: { type: Number, required: true, min: 0, default: 0 },
    nps_score: { type: Number, default: null },
    last_updated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

analyticsResultSchema.index({ surveyId: 1 }, { unique: true });

export type AnalyticsResult = InferSchemaType<typeof analyticsResultSchema>;

export default mongoose.model<AnalyticsResult>(
  "AnalyticsResult",
  analyticsResultSchema,
);

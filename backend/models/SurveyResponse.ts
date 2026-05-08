import mongoose from "mongoose";

const SurveyResponseSchema = new mongoose.Schema({
  surveyId: String,
  respondentToken: { type: String, required: true, trim: true },
  ipAddress: { type: String, default: "", trim: true },
  userAgent: { type: String, default: "", trim: true },
  deviceHash: { type: String, default: "", trim: true },
  responses: Object,
  submittedAt: { type: Date, default: Date.now },
});

SurveyResponseSchema.index(
  { surveyId: 1, respondentToken: 1 },
  { unique: true },
);
SurveyResponseSchema.index({ surveyId: 1, ipAddress: 1 });
SurveyResponseSchema.index({ surveyId: 1, deviceHash: 1 });

export default mongoose.model("SurveyResponse", SurveyResponseSchema);

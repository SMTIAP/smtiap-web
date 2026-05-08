import mongoose from 'mongoose';

const SurveyResponseSchema = new mongoose.Schema({
  surveyId: String,
  respondentToken: { type: String, required: true, trim: true },
  responses: Object,
  submittedAt: { type: Date, default: Date.now }
});

SurveyResponseSchema.index({ surveyId: 1, respondentToken: 1 }, { unique: true });

export default mongoose.model('SurveyResponse', SurveyResponseSchema);
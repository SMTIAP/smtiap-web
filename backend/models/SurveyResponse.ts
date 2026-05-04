import mongoose from 'mongoose';

const SurveyResponseSchema = new mongoose.Schema({
  surveyId: String,
  responses: Object,
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('SurveyResponse', SurveyResponseSchema);
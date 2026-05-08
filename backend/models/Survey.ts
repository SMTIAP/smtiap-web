import mongoose from "mongoose";

const branchingRuleSchema = new mongoose.Schema(
  {
    value: { type: String, required: true },
    targetQuestionId: { type: String, required: true },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema({
  id: { type: String },
  type: { type: String, required: true },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [String],
  placeholder: { type: String },
  max: { type: Number },
  min: { type: Number },
  branching: {
    enabled: { type: Boolean, default: false },
    rules: { type: [branchingRuleSchema], default: [] },
    defaultTargetQuestionId: { type: String },
  },
});

const pageSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String, default: "Page 1" },
  questions: [questionSchema],
});

const surveySchema = new mongoose.Schema(
  {
    surveyTitle: { type: String, required: true },
    description: { type: String, default: "" },
    websiteUrl: { type: String, default: "" },
    logo: { type: String, default: null },
    themeColor: { type: String, default: "#6366F1" },
    primaryColor: { type: String, default: "#6366F1" },
    customizeBranding: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },
    pages: [pageSchema],
    status: {
      type: String,
      enum: ["Draft", "Running", "Finished"],
      default: "Draft",
    },
    // ✅ Password protection fields
    isPasswordProtected: { type: Boolean, default: false },
    password:            { type: String, default: "" },
    tenantId:            { type: String, default: "default" },
    creatorId:           { type: String, required: true },
  },
  { timestamps: true },
);

const Survey = mongoose.model("Survey", surveySchema);
export default Survey;

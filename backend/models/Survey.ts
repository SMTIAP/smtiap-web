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
    backgroundColor: { type: String, default: "#F8FAFC" },
    customizeBranding: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },
    pages: [pageSchema],
    status: {
      type: String,
      enum: ["Draft", "Running", "Finished", "Scheduled"],
      default: "Draft",
    },
    //  Password protection fields
    isPasswordProtected: { type: Boolean, default: false },
    password: { type: String, default: "" },
    //  Scheduling fields
    scheduledOpen: { type: Date, default: null },
    scheduledClose: { type: Date, default: null },
    tenantId: { type: String, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

const Survey = mongoose.model("Survey", surveySchema);
export default Survey;
<<<<<<< HEAD
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "multiple-choice",
      "checkbox",
      "short-answer",
      "rating",
      "dropdown",
      "date",
      "matrix",
      "file-upload",
    ],
    required: true,
  },
  text:           { type: String, required: true },
  options:        [String],
  isRequired:     { type: Boolean, default: false },
  isLogicEnabled: { type: Boolean, default: false },
  // rating fields
  ratingMax:  { type: Number, default: 7 },
  ratingLow:  { type: String, default: "" },
  ratingHigh: { type: String, default: "" },
  // date fields
  dateFormat: { type: String, default: "MM/DD/YYYY" },
  // file upload fields
  fileType:    { type: String, default: "Any file type" },
  fileMaxSize: { type: String, default: "Max 5 MB" },
});

const surveySchema = new mongoose.Schema(
  {
    surveyTitle:       { type: String, required: true },
    description:       { type: String, default: "" },
    websiteUrl:        { type: String, default: "" },
    logo:              { type: String, default: null },
    themeColor:        { type: String, default: "#6366F1" },
    customizeBranding: { type: Boolean, default: false },
    isAnonymous:       { type: Boolean, default: false },
    questions:         [questionSchema],
    status: {
      type: String,
      enum: ["Draft", "Running", "Finished"],
      default: "Draft",
    },
    tenantId: { type: String, default: "default" },
  },
  { timestamps: true }
);

const Survey = mongoose.model("Survey", surveySchema);
export default Survey;
=======
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const surveySettingsSchema = new Schema(
  {
    anonymous: { type: Boolean, default: true },
    max_responses: { type: Number, min: 0, default: 1000 },
    password_protected: { type: Boolean, default: false },
  },
  { _id: false },
);

const surveySchema = new Schema(
  {
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    status: {
      type: String,
      required: true,
      enum: ["draft", "published", "closed", "archived"],
      default: "draft",
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "TenantUser",
      required: true,
    },
    published_at: { type: Date, default: null },
    expires_at: { type: Date, default: null },
    settings: { type: surveySettingsSchema, default: () => ({}) },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

surveySchema.index({ tenant_id: 1 });
surveySchema.index({ tenant_id: 1, status: 1 });

export type Survey = InferSchemaType<typeof surveySchema>;

export default mongoose.model<Survey>("Survey", surveySchema);
>>>>>>> origin/ai-analytics-intergration

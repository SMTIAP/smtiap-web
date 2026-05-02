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
import mongoose, { Schema } from "mongoose";

const questionPreviewSchema = new Schema(
  {
    type: { 
      type: String, 
      enum: ["short_text", "long_text", "multiple_choice", "checkboxes", "rating", "number", "date"], 
      required: true 
    },
    label: { 
      type: String, 
      required: true 
    },
    max: { 
      type: Number 
    },
    min: { 
      type: Number 
    },
    options: { 
      type: [String] 
    },
    placeholder: { 
      type: String 
    },
  },
  { _id: false }
);

const templateSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true 
    },
    category: { 
      type: String, 
      required: true, 
      trim: true 
    },
    usedCount: { 
      type: String, 
      default: "0+" 
    },
    gradient: { 
      type: String, 
      required: true 
    },
    estimatedTime: { 
      type: String, 
      enum: ["quick", "medium", "detailed", "comprehensive"],
      default: "quick"
    },
    aiPrompt: { 
      type: String, 
      default: "" 
    },
    previewQuestions: [questionPreviewSchema],
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { timestamps: true }
);

templateSchema.index({ category: 1 });
templateSchema.index({ isActive: 1 });
templateSchema.index({ title: "text", description: "text" });

export default mongoose.model("Template", templateSchema);
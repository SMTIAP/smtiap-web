import mongoose, { Schema } from "mongoose";

const questionPreviewSchema = new Schema(
  {
    type: { 
      type: String, 
      enum: ["text", "rating", "multiple_choice"], 
      required: true 
    },
    label: { 
      type: String, 
      required: true 
    },
    max: { 
      type: Number 
    },
    options: { 
      type: [String] 
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
    icon: { 
      type: String, 
      required: true 
    },
    aiPrompt: { 
      type: String, 
      required: true 
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
import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
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

categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });

export default mongoose.model("Category", categorySchema);
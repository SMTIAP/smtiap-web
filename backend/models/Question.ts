import mongoose, { Schema, type InferSchemaType } from "mongoose";

const questionSchema = new Schema(
  {
    survey_id: { type: Schema.Types.ObjectId, ref: "Survey", required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "multiple_choice",
        "checkbox",
        "short_text",
        "long_text",
        "rating",
        "nps",
        "dropdown",
        "date",
      ],
    },
    text: { type: String, required: true, trim: true },
    options: { type: [String], default: [] },
    required: { type: Boolean, default: false },
    order: { type: Number, required: true, min: 1 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

questionSchema.index({ survey_id: 1, order: 1 });

export type Question = InferSchemaType<typeof questionSchema>;

export default mongoose.model<Question>("Question", questionSchema);

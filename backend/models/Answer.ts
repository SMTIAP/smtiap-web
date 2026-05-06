import mongoose, { Schema, type InferSchemaType } from "mongoose";

const answerSchema = new Schema(
  {
    response_id: {
      type: Schema.Types.ObjectId,
      ref: "Response",
      required: true,
    },
    question_id: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: false },
);

answerSchema.index({ response_id: 1 });
answerSchema.index({ question_id: 1 });

export type Answer = InferSchemaType<typeof answerSchema>;

export default mongoose.model<Answer>("Answer", answerSchema);

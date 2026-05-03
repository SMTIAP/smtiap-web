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

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const deviceInfoSchema = new Schema(
  {
    ip: { type: String, trim: true, default: "" },
    browser: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const fraudFlagsSchema = new Schema(
  {
    is_suspicious: { type: Boolean, default: false },
    duplicate: { type: Boolean, default: false },
  },
  { _id: false },
);

const responseSchema = new Schema(
  {
    survey_id: { type: Schema.Types.ObjectId, ref: "Survey", required: true },
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    submitted_at: { type: Date, default: Date.now },
    is_anonymous: { type: Boolean, default: true },
    device_info: { type: deviceInfoSchema, default: () => ({}) },
    fraud_flags: { type: fraudFlagsSchema, default: () => ({}) },
  },
  { timestamps: false },
);

responseSchema.index({ survey_id: 1 });
responseSchema.index({ tenant_id: 1 });

export type Response = InferSchemaType<typeof responseSchema>;

export default mongoose.model<Response>("Response", responseSchema);

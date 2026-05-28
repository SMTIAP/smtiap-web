import mongoose, { Schema, type InferSchemaType } from "mongoose";

const brandingSchema = new Schema(
  {
    logo_url: { type: String, default: "" },
    theme_color: { type: String, default: "#000" },
  },
  { _id: false },
);

const settingsSchema = new Schema(
  {
    branding: { type: brandingSchema, default: () => ({}) },
    data_region: { type: String, default: "asia" },
  },
  { _id: false },
);

const tenantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    domain: { type: String, trim: true, required: true },
    orgType: { type: String, required: true },
    status: {
      type: String,
      // required: true,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    settings: { type: settingsSchema, default: () => ({}) },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// tenantSchema.index({ domain: 1 }, { unique: true });
tenantSchema.index(
  { domain: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
  }
);

export type Tenant = InferSchemaType<typeof tenantSchema>;

export default mongoose.model<Tenant>("Tenant", tenantSchema);

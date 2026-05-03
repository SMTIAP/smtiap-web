import mongoose, { Schema, type InferSchemaType } from "mongoose";

const subscriptionSchema = new Schema(
  {
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    plan: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "cancelled", "expired"],
      default: "active",
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    auto_renew: { type: Boolean, default: true },
  },
  { timestamps: false },
);

subscriptionSchema.index({ tenant_id: 1 });

export type Subscription = InferSchemaType<typeof subscriptionSchema>;

export default mongoose.model<Subscription>("Subscription", subscriptionSchema);

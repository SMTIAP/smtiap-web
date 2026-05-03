import mongoose, { Schema, type InferSchemaType } from "mongoose";

const notificationSchema = new Schema(
  {
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "TenantUser", required: true },
    type: {
      type: String,
      required: true,
      enum: ["email", "sms", "push", "in_app"],
    },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "sent", "failed", "read"],
      default: "pending",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

notificationSchema.index({ tenant_id: 1 });
notificationSchema.index({ user_id: 1 });

export type Notification = InferSchemaType<typeof notificationSchema>;

export default mongoose.model<Notification>("Notification", notificationSchema);

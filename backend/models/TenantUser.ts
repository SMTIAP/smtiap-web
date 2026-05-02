import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password_hash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "editor", "viewer"],
      default: "viewer",
    },
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    last_login: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

userSchema.index({ tenant_id: 1, email: 1 }, { unique: true });

export type User = InferSchemaType<typeof userSchema>;

export default mongoose.model<User>("TenantUser", userSchema);

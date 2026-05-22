import { Schema, model } from "mongoose";

const userTenantRoleSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    role: {
      type: String,
      enum: [
        "viewer",
        "admin",
        "creator",
        "billing_manager",
        "super_admin",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    }
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate membership
userTenantRoleSchema.index(
  { userId: 1, tenantId: 1 },
  { unique: true }
);

export default model("UserTenantRole", userTenantRoleSchema);
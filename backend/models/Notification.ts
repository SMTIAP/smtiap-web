import mongoose, { Schema } from "mongoose";

export interface NotificationDoc {
  tenant_id: mongoose.Types.ObjectId | null;
  user_id: mongoose.Types.ObjectId;

  type:
    | "ORGANIZATION_CREATED"
    | "USER_ADDED"
    | "ROLE_CHANGED"
    | "USER_REMOVED"
    | "TENANT_DEACTIVATED"
    | "SURVEY_CREATED"
    | "SURVEY_UPDATE"
    | "SURVEY_PUBLISHED"
    | "SURVEY_STOPPED";

  channel?: "in_app" | "email" | "sms" | "push" | null;

  data?: {
    message: string;
  };

  delivery_status: "pending" | "sent" | "failed";

  read_at?: Date | null;

  status: "active" | "archived" | "deleted";

  created_at?: Date;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    tenant_id: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: false,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "ORGANIZATION_CREATED",
        "USER_ADDED",
        "ROLE_CHANGED",
        "USER_REMOVED",
        "TENANT_DEACTIVATED",
        "SURVEY_CREATED",
        "SURVEY_UPDATE",
        "SURVEY_PUBLISHED",
        "SURVEY_STOPPED",
        
      ],
    },

    channel: {
      type: String,
      enum: ["in_app", "email", "sms", "push"],
      default: null,
    },

    data: {
      type: Schema.Types.Mixed,
      required: false,
    },

    delivery_status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "sent",
    },

    read_at: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

notificationSchema.index({ tenant_id: 1 });
notificationSchema.index({ user_id: 1 });
notificationSchema.index({ user_id: 1, read_at: 1 });

export default mongoose.model<NotificationDoc>(
  "Notification",
  notificationSchema
);
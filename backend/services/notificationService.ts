import Notification from "../models/Notification.js";

interface CreateNotificationPayload {
  tenant_id: string;
  user_id: string;
  message: string;
  type:
    | "ORGANIZATION_CREATED"
    | "USER_ADDED"
    | "ROLE_CHANGED"
    | "USER_REMOVED"
    | "TENANT_DEACTIVATED";
  channel?: "in_app" | "email" | "sms" | "push";
}

export const createAppNotification = async ({
  tenant_id,
  user_id,
  message,
  type,
  channel = "in_app",
}: CreateNotificationPayload) => {
  return Notification.create({
    tenant_id,
    user_id,
    type,
    channel,
    data: {
      message,
    },
    delivery_status: "pending",
  });
};
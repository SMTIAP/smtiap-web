import Notification from "../models/Notification.js";
import mongoose from "mongoose";

interface CreateNotificationPayload {
  tenant_id: string;
  user_id: string;
  message: string;
  type:
    | "ORGANIZATION_CREATED"
    | "USER_ADDED"
    | "ROLE_CHANGED"
    | "USER_REMOVED"
    | "TENANT_DEACTIVATED"
    | "SURVEY_CREATED"
    | "SURVEY_UPDATE"
    | "SURVEY_PUBLISHED"
    | "SURVEY_STOPPED"
    | "REGISTERED";
  channel?: "in_app" | "email" | "sms" | "push";
  surveyId?: string;
  surveyName?: string;
}

export const createAppNotification = async ({
  tenant_id,
  user_id,
  message,
  type,
  channel = "in_app",
  surveyId,
  surveyName,
}: CreateNotificationPayload) => {
    const safeTenantId =
    tenant_id && mongoose.Types.ObjectId.isValid(tenant_id)
      ? tenant_id
      : null;
  return Notification.create({
    tenant_id: safeTenantId,
    user_id,
    type,
    channel,
    data: {
      message,
      ...(surveyId && { surveyId }),
      ...(surveyName && { surveyName }),
    },
    delivery_status: "sent",
  });
};
import axios from "axios";
import {
  SlackNotificationPayloadBulk,
  SlackNotificationPayload,
} from "../types/slack";

export const sendSlackNotification = async (
  payload: SlackNotificationPayload
) => {
  try {
    await axios.post("/api/sendToSlack", payload);
  } catch (error: any) {
    console.error("❌ Error al enviar la notificación a Slack:", error.message);
  }
};

export const sendSlackNotificationBulk = async (
  payload: SlackNotificationPayloadBulk
) => {
  try {
    await axios.post("/api/slackBulk", payload);
  } catch (error: any) {
    console.error(
      "❌ Error al enviar la notificación a Slack Bulk:",
      error.message
    );
  }
};

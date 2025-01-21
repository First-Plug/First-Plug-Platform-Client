import axios from "axios";
import {
  SlackNotificationPayloadBulk,
  SlackNotificationPayload,
} from "../types/slack";
import { NextResponse } from "next/server";

export const sendSlackNotification = async (
  payload: SlackNotificationPayload
) => {
  try {
    await axios.post("/api/sendToSlack", payload);
  } catch (error: any) {
    console.error("❌ Error al enviar la notificación a Slack:", {
      message: error.message,
      stack: error.stack,
      config: error.config,
      response: error.response ? error.response.data : "Sin respuesta de Slack",
      status: error.response ? error.response.status : "Sin estado",
    });

    return NextResponse.json(
      { error: error.message || "Error desconocido" },
      { status: 500 }
    );
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

import axios from "axios";

export interface SlackNotificationPayload {
  from: {
    name: string;
    address: string;
    zipCode: string;
    phone?: string;
    email?: string;
    dni?: string;
  };
  to: {
    name: string;
    address: string;
    zipCode: string;
    phone?: string;
    email?: string;
    dni?: string;
  };
  products: {
    category: string;
    brand?: string;
    model?: string;
    name?: string;
    serialNumber?: string;
  }[];
  action: string;
  tenantName: string;
}

export const sendSlackNotification = async (
  payload: SlackNotificationPayload
) => {
  try {
    console.log("🔵 Payload enviado a /api/sendToSlack:", payload);
    const response = await axios.post("/api/sendToSlack", payload);
    console.log("✅ Respuesta del endpoint Slack:", response.data);
  } catch (error: any) {
    console.error("❌ Error al enviar la notificación a Slack:", error.message);
  }
};

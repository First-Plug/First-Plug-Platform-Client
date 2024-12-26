import axios from "axios";

export interface SlackNotificationPayload {
  from: {
    name: string;
    address: string;
    apartment?: string;
    zipCode: string;
    phone?: string;
    email?: string;
    dni?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  to: {
    name: string;
    address: string;
    apartment?: string;
    zipCode: string;
    phone?: string;
    email?: string;
    dni?: string;
    city?: string;
    state?: string;
    country?: string;
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
    await axios.post("/api/sendToSlack", payload);
  } catch (error: any) {
    console.error("❌ Error al enviar la notificación a Slack:", error.message);
  }
};

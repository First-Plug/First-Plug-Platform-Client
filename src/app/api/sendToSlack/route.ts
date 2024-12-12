import axios from "axios";
import { NextResponse } from "next/server";

const webhookUrl = process.env.SLACK_WEBHOOK_URL_SHIPMENTS;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!webhookUrl) {
      throw new Error(
        "SLACK_WEBHOOK_URL no está definido en las variables de entorno"
      );
    }

    await axios.post(webhookUrl, body);
    return NextResponse.json(
      { message: "Mensaje enviado a Slack exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}

import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await axios.post(
      "https://hooks.slack.com/services/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",
      body
    );

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

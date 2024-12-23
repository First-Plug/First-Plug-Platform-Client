import axios from "axios";
import { NextResponse } from "next/server";

const webhookUrl = process.env.SLACK_WEBHOOK_URL_SHIPMENTS;

export async function POST(request: Request) {
  try {
    const { from, to, products, action, tenantName } = await request.json();

    if (!webhookUrl) {
      throw new Error(
        "SLACK_WEBHOOK_URL_SHIPMENTS no está definido en las variables de entorno"
      );
    }
    if (!tenantName) {
      console.error("El tenantName no está definido en el payload.");
    }
    const blocks = [];

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Tenant:* ${tenantName}\n:package: *${action}*\n`,
      },
    });

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*De:* ${from.name}\nDirección: ${from.address}\nCódigo postal: ${
          from.zipCode
        }\n${from.phone ? `Teléfono: ${from.phone}\n` : ""}${
          from.email ? `Correo personal: ${from.email}\n` : ""
        }${from.dni ? `DNI/CI: ${from.dni}\n` : ""}`,
      },
    });

    products.forEach((product, index) => {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Producto ${index + 1}:*\nCategoría: ${
            product.category
          }\nMarca: ${product.brand || "N/A"}\nModelo: ${
            product.model || "N/A"
          }\nNombre: ${product.name || "N/A"}\nSerial: ${
            product.serialNumber || "N/A"
          }\n`,
        },
      });
    });

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `*Para:* ${to.name || "N/A"}\n` +
          (to.name === "Oficina del cliente"
            ? `Dirección: ${to.address || "N/A"}, ${to.apartment || "N/A"}\n` +
              `Código postal: ${to.zipCode || "N/A"}\n` +
              `Ciudad: ${to.city || "N/A"}\n` +
              `Estado: ${to.state || "N/A"}\n` +
              `País: ${to.country || "N/A"}\n`
            : to.name === "FP Warehouse"
            ? "Dirección: N/A\nCódigo postal: N/A\n"
            : `Dirección: ${to.address || "N/A"}\n` +
              `Código postal: ${to.zipCode || "N/A"}\n` +
              (to.phone ? `Teléfono: ${to.phone}\n` : "") +
              (to.email ? `Correo personal: ${to.email}\n` : "") +
              (to.dni ? `DNI/CI: ${to.dni}\n` : "")),
      },
    });
    console.log("🔵 Blocks enviados a Slack:", blocks);
    await axios.post(webhookUrl, { blocks });

    return NextResponse.json(
      { message: "Mensaje enviado a Slack exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al enviar el mensaje a Slack:", error.message);
    return NextResponse.json(
      { error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}

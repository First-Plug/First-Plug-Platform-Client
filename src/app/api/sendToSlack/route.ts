import axios from "axios";
import { NextResponse } from "next/server";

const webhookUrl = process.env.SLACK_WEBHOOK_URL_SHIPMENTS;
console.log("🔍 Webhook URL:", webhookUrl || "No definido");

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsedDate);
}

export async function POST(request: Request) {
  try {
    const { from, to, products, action, tenantName, shipment } =
      await request.json();

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
        text: `*Tenant:* ${tenantName}\n*Order ID:* ${
          shipment?.orderId || ""
        }\n*Fecha deseable de pickup:* ${
          formatDate(shipment?.pickup) || "ASAP"
        }\n*Fecha deseable de delivery:* ${
          formatDate(shipment?.delivery) || "ASAP"
        }\n:package: *${action}*\n`,
      },
    });

    if (action !== "Create Product") {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*De:* ${from.name}\nPaís: ${from.country || "N/A"}\nEstado: ${
            from.state || "N/A"
          }\nCiudad: ${from.city || "N/A"}\nDirección: ${
            from.address || "N/A"
          }, ${from.apartment || "N/A"}\nCódigo postal: ${
            from.zipCode || "N/A"
          }\n${from.email ? `Email: ${from.email}\n` : ""}${
            from.personalEmail ? `Correo personal: ${from.personalEmail}\n` : ""
          }${from.phone ? `Teléfono: ${from.phone}\n` : ""}${
            from.dni ? `DNI/CI: ${from.dni}\n` : ""
          }`,
        },
      });
    }

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
            ? `País: ${to.country || "N/A"}\n` +
              `Estado: ${to.state || "N/A"}\n` +
              `Ciudad: ${to.city || "N/A"}\n` +
              `Dirección: ${to.address || "N/A"}, ${
                to.apartment || "N/A"
              }\nCódigo postal: ${to.zipCode || "N/A"}\n` +
              `Email: ${to.email || "N/A"}\n` +
              (to.personalEmail
                ? `Correo personal: ${to.personalEmail}\n`
                : "") +
              `Teléfono: ${to.phone || "N/A"}\n`
            : to.name === "FP Warehouse"
            ? "Dirección: N/A\nCódigo postal: N/A\n"
            : `País: ${to.country || "N/A"}\n` +
              `Estado: ${to.state || "N/A"}\n` +
              `Ciudad: ${to.city || "N/A"}\n` +
              `Dirección: ${to.address || "N/A"}, ${
                to.apartment || "N/A"
              }\nCódigo postal: ${to.zipCode || "N/A"}\n` +
              `Email: ${to.email || "N/A"}\n` +
              (to.personalEmail
                ? `Correo personal: ${to.personalEmail}\n`
                : "") +
              (to.phone ? `Teléfono: ${to.phone}\n` : "") +
              (to.dni ? `DNI/CI: ${to.dni}\n` : "")),
      },
    });

    await axios.post(webhookUrl, { blocks });

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

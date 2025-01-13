import axios from "axios";
import { NextResponse } from "next/server";

const webhookUrl = process.env.SLACK_WEBHOOK_URL_BULK_SHIPMENTS;

export async function POST(request: Request) {
  try {
    const { tenantName, action, products, to } = await request.json();

    if (!webhookUrl) {
      throw new Error(
        "SLACK_WEBHOOK_URL_BULK_SHIPMENTS no está definido en las variables de entorno"
      );
    }

    if (!tenantName || !action || !products || !to) {
      throw new Error("Faltan datos requeridos en el payload");
    }

    if (!Array.isArray(to)) {
      throw new Error("'to' debe ser un array");
    }

    const blocks = [];

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Tenant:* ${tenantName}\n:package: *${action}*\n`,
      },
    });

    const product = products[0];
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Producto:*\nCantidad total: ${product.quantity}\nCategoría: ${
          product.category
        }\nMarca: ${product.brand || "N/A"}\nModelo: ${
          product.model || "N/A"
        }\nNombre: ${product.name || "N/A"}`,
      },
    });

    to.forEach((assignment: any) => {
      const {
        name,
        quantity,
        serialNumbers,
        address,
        apartment,
        city,
        country,
        email,
        personalEmail,
        phone,
        state,
        zipCode,
        dni,
      } = assignment;

      let assignmentDetails = `*Para:* ${name}\nCantidad asignada: ${quantity}\n`;

      const formattedSerialNumbers = Array.isArray(serialNumbers)
        ? serialNumbers.join(", ")
        : serialNumbers;

      if (formattedSerialNumbers && formattedSerialNumbers !== "N/A") {
        assignmentDetails += `Números de serie: ${formattedSerialNumbers}\n`;
      }

      const fullAddress = `${address || "N/A"}${
        apartment && apartment !== "N/A" ? `, ${apartment}` : ""
      }`;

      assignmentDetails += `País: ${country || "N/A"}\nEstado: ${
        state || "N/A"
      }\nCiudad: ${city || "N/A"}\nDirección: ${fullAddress}\nCódigo postal: ${
        zipCode || "N/A"
      }\nEmail: ${email || "N/A"}\nCorreo personal: ${
        personalEmail || "N/A"
      }\nTeléfono: ${phone || "N/A"}\nDNI/CI: ${dni || "N/A"}`;

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: assignmentDetails,
        },
      });
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

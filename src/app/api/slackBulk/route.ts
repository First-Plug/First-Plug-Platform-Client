import axios from "axios";
import { NextResponse } from "next/server";

const webhookUrl = process.env.SLACK_WEBHOOK_URL_BULK_SHIPMENTS;

export async function POST(request: Request) {
  try {
    const { tenantName, action, products, assignments } = await request.json();

    if (!webhookUrl) {
      throw new Error(
        "SLACK_WEBHOOK_URL_BULK_SHIPMENTS no está definido en las variables de entorno"
      );
    }

    if (!tenantName || !action || !products || !assignments) {
      throw new Error("Faltan datos requeridos en el payload");
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
        text: `*Producto:*\nCantidad total: ${products.length}\nCategoría: ${
          product.category
        }\nMarca: ${product.brand || "N/A"}\nModelo: ${
          product.model || "N/A"
        }\nNombre: ${product.name || "N/A"}`,
      },
    });

    assignments.forEach((assignment) => {
      const {
        locationType,
        name,
        quantity,
        serialNumbers,
        country,
        state,
        city,
        address,
        zipCode,
        email,
        personalEmail,
        phone,
        dni,
      } = assignment;

      let assignmentDetails = `*Para:* ${
        name || locationType
      }\nCantidad: ${quantity}\n`;

      if (serialNumbers && serialNumbers.length > 0) {
        assignmentDetails += `Número de serie: ${serialNumbers.join(", ")}\n`;
      }

      if (locationType === "Oficina del cliente") {
        assignmentDetails += `País: ${country || "N/A"}\nEstado: ${
          state || "N/A"
        }\nCiudad: ${city || "N/A"}\nDirección: ${
          address || "N/A"
        }\nCódigo postal: ${zipCode || "N/A"}\nEmail: ${
          email || "N/A"
        }\nTeléfono: ${phone || "N/A"}`;
      } else if (locationType === "FP Warehouse") {
        assignmentDetails += "Dirección: N/A\nCódigo postal: N/A\n";
      } else if (locationType === "Empleado") {
        assignmentDetails += `País: ${country || "N/A"}\nEstado: ${
          state || "N/A"
        }\nCiudad: ${city || "N/A"}\nDirección: ${
          address || "N/A"
        }\nCódigo postal: ${zipCode || "N/A"}\nEmail: ${
          email || "N/A"
        }\nCorreo personal: ${personalEmail || "N/A"}\nTeléfono: ${
          phone || "N/A"
        }\nDNI/CI: ${dni || "N/A"}`;
      }

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
    console.error("Error al enviar el mensaje a Slack:", error.message);
    return NextResponse.json(
      { error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}

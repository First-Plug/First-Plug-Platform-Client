export function createSlackMessage(
  sender: { type: string; data: any },
  receiver: { type: string; data: any },
  products: any
): object {
  const productBlocks = products.map((product, index) => {
    const productText = [
      `*Producto n:* ${index + 1}`,
      product.category ? `*Categoría:* ${product.category}` : "",
      product.attributes.find((attr) => attr.key === "brand")?.value
        ? `*Marca:* ${
            product.attributes.find((attr) => attr.key === "brand")?.value
          }`
        : "",
      product.attributes.find((attr) => attr.key === "model")?.value
        ? `*Modelo:* ${
            product.attributes.find((attr) => attr.key === "model")?.value
          }`
        : "",
      product.name ? `*Nombre:* ${product.name}` : "",
      product.serialNumber ? `*Serial:* ${product.serialNumber}` : "",
    ]
      .filter((line) => line)
      .join("\n");

    return {
      type: "section",
      text: {
        type: "mrkdwn",
        text: productText,
      },
    };
  });

  const blocks = [];

  const senderTitle =
    sender.type === "fp-warehouse"
      ? "FP Warehouse"
      : sender.type === "office"
      ? "Oficina del cliente"
      : sender.data?.fullName || "";

  const senderText = [
    `*De:* ${senderTitle}`,
    sender.type !== "fp-warehouse" && sender.data.country
      ? `*Dirección*: ${sender.data.country}, ${sender.data.city || ""}, ${
          sender.data.address || ""
        }, ${sender.data.apartment || ""}`
      : "",
    sender.type !== "fp-warehouse" && sender.data.zipCode
      ? `*Código postal:* ${sender.data.zipCode}`
      : "",
    sender.data.phone ? `*Teléfono:* ${sender.data.phone}` : "",
    sender.type === "office" && sender.data.email
      ? `*Correo:* ${sender.data.email}`
      : sender.type !== "office" && sender.data.personalEmail
      ? `*Correo:* ${sender.data.personalEmail}`
      : "",
    sender.type !== "office" && sender.data.dni
      ? `*DNI/CI:* ${sender.data.dni}`
      : "",
  ]
    .filter((line) => line)
    .join("\n");

  if (senderText) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: senderText,
      },
    });
  }

  blocks.push({ type: "divider" });
  blocks.push(...productBlocks);

  const receiverTitle =
    receiver.type === "fp-warehouse"
      ? "FP Warehouse"
      : receiver.type === "office"
      ? "Oficina del cliente"
      : receiver.data.fullName || "";

  const receiverText = [
    `*Para:* ${receiverTitle}`,
    receiver.type !== "fp-warehouse" && receiver.data.country
      ? `*Dirección*: ${receiver.data.country}, ${receiver.data.city || ""}, ${
          receiver.data.address || ""
        }, ${receiver.data.apartment || ""}`
      : "",
    receiver.type !== "fp-warehouse" && receiver.data.zipCode
      ? `*Código postal:* ${receiver.data.zipCode}`
      : "",
    receiver.data.phone ? `*Teléfono:* ${receiver.data.phone}` : "",
    receiver.type === "office" && receiver.data.email
      ? `*Correo:* ${receiver.data.email}`
      : receiver.type !== "office" && receiver.data.personalEmail
      ? `*Correo:* ${receiver.data.personalEmail}`
      : "",
    receiver.type !== "office" &&
    sender.data.dni &&
    receiver.type !== "fp-warehouse"
      ? `*DNI/CI:* ${sender.data.dni}`
      : "",
  ]
    .filter((line) => line)
    .join("\n");

  if (receiverText) {
    blocks.push({ type: "divider" });
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: receiverText,
      },
    });
  }

  blocks.push({ type: "divider" });

  return { blocks };
}

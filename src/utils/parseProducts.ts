import { AtrributeZod, CsvProduct, PrdouctModelZod } from "@/types";

export function parseProduct(product: CsvProduct): PrdouctModelZod {
  const arrayOfAttributes: AtrributeZod[] = [
    {
      key: "brand",
      value: product.brand || "",
    },
    {
      key: "model",
      value: product.model || "",
    },
    {
      key: "color",
      value: product.color || "",
    },
    {
      key: "screen",
      value: product.screen || "",
    },
    {
      key: "keyboardLanguage",
      value: product.keyboardLanguage || "",
    },
    {
      key: "processor",
      value: product.processor || "",
    },
    {
      key: "ram",
      value: product.ram || "",
    },

    {
      key: "storage",
      value: product.storage || "",
    },
    {
      key: "gpu",
      value: product.gpu || "",
    },
  ];
  const response: PrdouctModelZod = {
    category: product["category*"],
    acquisitionDate: product.acquisitionDate,
    name: product["name*"],
    location: product["location*"],
    attributes: arrayOfAttributes,
    assignedEmail: product.assignedEmail,
    serialNumber: product.serialNumber,
    status: product.assignedEmail ? "Delivered" : "Available",
    recoverable: false,
  };

  return response;
}

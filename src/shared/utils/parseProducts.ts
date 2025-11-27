import {
  AtrributeZod,
  CATEGORY_KEYS,
  PrdouctModelZod,
} from "@/features/assets";

import { CsvProduct } from "@/shared";

export function parseProduct(product: CsvProduct): PrdouctModelZod {
  const arrayOfAttributes: AtrributeZod[] = [
    {
      key: "brand",
      value: product["brand*"] || "",
    },
    {
      key: "model",
      value: product["model*"] || "",
    },
    {
      key: "color",
      value: product.color || "",
    },
    {
      key: "screen",
      value: product.screen,
    },
    {
      key: "keyboardLanguage",
      value: product.keyboardLanguage,
    },
    {
      key: "processor",
      value: product.processor,
    },
    {
      key: "ram",
      value: product.ram,
    },

    {
      key: "storage",
      value: product.storage,
    },
    {
      key: "gpu",
      value: product.gpu,
    },
  ];

  const attributes = arrayOfAttributes.filter((atribute) =>
    CATEGORY_KEYS[product["category*"]].includes(atribute.key)
  );

  // Construir objeto price si hay datos
  const price =
    product["Price per unit"] || product.Currency
      ? {
          amount:
            typeof product["Price per unit"] === "string"
              ? parseFloat(product["Price per unit"])
              : product["Price per unit"],
          currencyCode: product.Currency,
        }
      : undefined;

  // Recoverable ya viene como booleano desde el esquema CSV
  const recoverable =
    typeof product.Recoverable === "boolean" ? product.Recoverable : undefined;

  const response: PrdouctModelZod = {
    category: product["category*"],
    acquisitionDate: product.acquisitionDate,
    name: product.name,
    location: product["location*"],
    attributes,
    assignedEmail: product.assignedEmail,
    serialNumber: product.serialNumber,
    status: product.assignedEmail ? "Delivered" : "Available",
    productCondition: product["Product Condition"] || "Optimal",
    additionalInfo: product["Additional info"] || "",
    country: product["country*"],
    officeName: product["officeName*"],
    recoverable,
    price,
  };

  return response;
}

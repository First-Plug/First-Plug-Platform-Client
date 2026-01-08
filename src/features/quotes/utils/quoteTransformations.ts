import type { QuoteProduct, QuoteRequestPayload } from "../types/quote.types";
import { COUNTRY_TO_ISO } from "./constants";

/**
 * Convierte un nombre de país a su código ISO de 2 letras
 * @param countryName - Nombre del país o código ISO existente
 * @returns Código ISO de 2 letras
 */
export function getCountryISO(countryName: string): string {
  if (countryName.length === 2 && /^[A-Z]{2}$/i.test(countryName)) {
    return countryName.toUpperCase();
  }

  const iso = COUNTRY_TO_ISO[countryName];
  if (iso) {
    return iso;
  }

  return countryName.substring(0, 2).toUpperCase();
}

/**
 * Elimina campos undefined y null de un objeto
 * @param obj - Objeto a limpiar
 * @returns Objeto sin campos undefined o null
 */
export function removeUndefinedFields<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Mapea el sistema operativo a su formato estándar
 * @param os - Sistema operativo en formato lowercase
 * @returns Sistema operativo en formato estándar o undefined
 */
function mapOS(os?: string): string | undefined {
  if (!os) return undefined;
  const osMap: Record<string, string> = {
    macos: "macOS",
    windows: "Windows",
    linux: "Linux",
  };
  return osMap[os.toLowerCase()] || os;
}

/**
 * Transforma un producto de QuoteProduct al formato esperado por el backend
 * @param product - Producto en formato QuoteProduct
 * @returns Producto transformado en formato del backend
 * @throws Error si hay problemas con la fecha, cantidad o garantía extendida
 */
export function transformProductToBackendFormat(
  product: QuoteProduct
): QuoteRequestPayload["products"][0] {
  let deliveryDate: string | undefined;
  if (product.requiredDeliveryDate) {
    const dateStr = product.requiredDeliveryDate;
    // Extraer solo la fecha en formato YYYY-MM-DD (sin tiempo)
    // Si viene en formato ISO con tiempo, extraer solo la parte de la fecha
    const dateOnly = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    // Validar que sea un formato de fecha válido (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateOnly)) {
      throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
    }
    deliveryDate = dateOnly;
  }

  const quantity =
    typeof product.quantity === "number"
      ? Math.floor(Math.abs(product.quantity))
      : Math.floor(Math.abs(parseInt(String(product.quantity || 1), 10)));

  if (quantity < 1) {
    throw new Error("quantity must be a positive integer");
  }

  const category = product.category
    ? product.category.charAt(0).toUpperCase() +
      product.category.slice(1).toLowerCase()
    : "";

  const countryISO = product.country ? getCountryISO(product.country) : "";

  const transformed: any = {
    category: category,
    quantity: quantity,
    country: countryISO,
  };

  if (product.operatingSystem) {
    const mappedOS = mapOS(product.operatingSystem);
    if (mappedOS) {
      transformed.os = mappedOS;
    }
  }

  if (product.brands && product.brands.length > 0) {
    transformed.brand = product.brands;
  }

  if (product.models && product.models.length > 0) {
    transformed.model = product.models;
  }

  if (product.processors && product.processors.length > 0) {
    transformed.processor = product.processors;
  }

  if (product.ram && product.ram.length > 0) {
    transformed.ram = product.ram;
  }

  if (product.storage && product.storage.length > 0) {
    transformed.storage = product.storage;
  }

  if (product.screenSize && product.screenSize.length > 0) {
    transformed.screenSize = product.screenSize;
  }

  if (product.screenTechnology && product.screenTechnology.length > 0) {
    transformed.screenTechnology = product.screenTechnology;
  }

  if (product.otherSpecifications) {
    transformed.otherSpecifications = product.otherSpecifications;
  }

  if (product.description) {
    transformed.description = product.description;
  }

  if (product.additionalRequirements) {
    transformed.additionalRequirements = product.additionalRequirements;
  }

  if (product.furnitureType && product.furnitureType.length > 0) {
    transformed.furnitureType = product.furnitureType;
  }

  if (product.extendedWarranty?.enabled !== undefined) {
    transformed.extendedWarranty = Boolean(product.extendedWarranty.enabled);

    if (product.extendedWarranty.enabled) {
      if (!product.extendedWarranty.extraYears) {
        throw new Error(
          "extendedWarrantyYears is required when extendedWarranty is true"
        );
      }
      transformed.extendedWarrantyYears = product.extendedWarranty.extraYears;
    }
  }

  if (product.deviceEnrollment !== undefined) {
    transformed.deviceEnrollment = Boolean(product.deviceEnrollment);
  }

  if (product.city) {
    transformed.city = product.city;
  }

  if (deliveryDate) {
    transformed.deliveryDate = deliveryDate;
  }

  if (product.additionalComments) {
    transformed.comments = product.additionalComments;
  }

  return removeUndefinedFields(
    transformed
  ) as QuoteRequestPayload["products"][0];
}

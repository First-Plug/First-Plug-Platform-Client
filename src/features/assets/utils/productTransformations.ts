import type { Product, Category, ProductStatus } from "../interfaces/product";

/**
 * Agrega "GB" al valor de RAM si no lo tiene
 */
export const addGBToRam = (value: string): string => {
  if (!value || typeof value !== "string") return value;
  const trimmedValue = value.trim();
  if (trimmedValue && !trimmedValue.toLowerCase().endsWith("gb")) {
    return `${trimmedValue}GB`;
  }
  return trimmedValue;
};

/**
 * Quita "GB" del valor de RAM para mostrar
 */
export const removeGBFromRam = (value: string): string => {
  if (typeof value === "string" && value.toLowerCase().endsWith("gb")) {
    return value.slice(0, -2).trim();
  }
  return value;
};

/**
 * Normaliza la ubicación "FP Warehouse" a "FP warehouse"
 */
export const normalizeLocation = (location: string | undefined): string => {
  if (!location) return "";
  if (location === "FP Warehouse") {
    return "FP warehouse";
  }
  return location;
};

/**
 * Calcula el status del producto basado en la condición, location y assignedEmail
 */
export const calculateProductStatus = (
  productCondition: string | undefined,
  location: string | undefined,
  assignedEmail: string | undefined
): ProductStatus => {
  if (productCondition === "Unusable") {
    return "Unavailable";
  }

  // Si se ha asignado un miembro y la ubicación es "Employee", el status es "Delivered"
  if (assignedEmail && location === "Employee") {
    return "Delivered";
  }

  // Si no es "Employee", es una oficina, por lo tanto está "Available"
  if (location && location !== "Employee") {
    return "Available";
  }

  return "Available";
};

/**
 * Formatea los atributos para envío, agregando "GB" a RAM si es necesario
 */
export const formatAttributesForSubmit = (
  attributes: Array<{ key: string; value: string; _id?: string }>,
  fields: Array<{ name: string }>
): Array<{ _id: string; key: string; value: string }> => {
  return fields.map((field) => {
    const attr = attributes.find((a) => a?.key === field.name);
    let finalValue = attr?.value || "";

    // Si es RAM, agregar "GB" si no lo tiene
    if (field.name === "ram" && finalValue) {
      finalValue = addGBToRam(finalValue);
    }

    return {
      _id: attr?._id || "",
      key: field.name,
      value: finalValue,
    };
  });
};

/**
 * Procesa atributos iniciales para quitar "GB" de RAM (solo para display)
 */
export const processAttributesForDisplay = (
  attributes: Array<{ key: string; value: string }>
): Array<{ key: string; value: string }> => {
  return attributes.map((attr) => {
    if (attr?.key === "ram" && attr?.value) {
      return { ...attr, value: removeGBFromRam(attr.value) };
    }
    return attr;
  });
};

/**
 * Procesa opciones de RAM para quitar "GB" visualmente
 */
export const processRamOptions = (
  options: (string | { display: React.ReactNode; value: string })[]
): (string | { display: React.ReactNode; value: string })[] => {
  return options.map((opt) => {
    if (typeof opt === "string" && opt.toLowerCase().endsWith("gb")) {
      return opt.slice(0, -2).trim();
    }
    return opt;
  });
};





import type { Category } from "../interfaces/product";

/**
 * Valida que los atributos requeridos estén presentes según la categoría
 */
export const validateRequiredAttributes = (
  attributes: Array<{ key?: string; value?: string }>,
  category: Category | undefined
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (category !== "Merchandising") {
    const brand = attributes.find((attr) => attr?.key === "brand")?.value;
    const model = attributes.find((attr) => attr?.key === "model")?.value;

    if (!brand) {
      errors["brand"] = "Brand is required.";
    }

    if (!model) {
      errors["model"] = "Model is required.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Valida el nombre del producto según la categoría y el modelo
 */
export const validateProductName = (
  name: string | undefined,
  category: Category | undefined,
  model: string | undefined
): { isValid: boolean; error?: string } => {
  // Merchandising siempre requiere nombre
  if (category === "Merchandising") {
    if (!name || name.trim() === "") {
      return {
        isValid: false,
        error: "Product Name is required for Merchandising.",
      };
    }
  }

  // Si el modelo es "Other", requiere nombre
  if (model === "Other") {
    if (!name || name.trim() === "") {
      return {
        isValid: false,
        error: "Product Name is required when model is Other.",
      };
    }
  }

  return { isValid: true };
};

/**
 * Valida assignedEmail y location
 */
export const validateAssignment = (
  assignedEmail: string | undefined | null,
  location: string | undefined
): { isValid: boolean; error?: string; field?: string } => {
  if (assignedEmail === undefined || assignedEmail === null) {
    return {
      isValid: false,
      error: "Assigned Member is required.",
      field: "assignedEmail",
    };
  }

  // Si no hay member seleccionado o es "None", location es requerida
  if (
    (!assignedEmail || assignedEmail === "None") &&
    (!location || location === "")
  ) {
    return {
      isValid: false,
      error: "Location is required",
      field: "location",
    };
  }

  return { isValid: true };
};





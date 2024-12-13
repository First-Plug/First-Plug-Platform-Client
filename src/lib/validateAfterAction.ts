import {
  capitalizeAndSeparateCamelCase,
  getMissingFields,
  validateBillingInfo,
} from "@/lib/utils";
import { TeamMember, Product, User } from "@/types";

export const validateAfterAction = (source, destination): string[] => {
  const missingMessages: string[] = [];

  console.log("Validating source and destination...");

  // Función genérica para manejar validaciones
  const validateEntity = (
    entity: { type: "member" | "office"; data: any },
    role: "Current holder" | "Assigned member" | "Assigned location"
  ) => {
    if (!entity || !entity.data) return;

    // Excepción para FP warehouse
    if (
      entity.type === "office" &&
      entity.data.location &&
      entity.data.location === "FP warehouse"
    ) {
      console.log(`Skipping validation for ${role} (${entity.data.location})`);
      return;
    }

    if (entity.type === "member") {
      const missingFields = getMissingFields(entity.data as TeamMember);
      if (missingFields.length > 0) {
        const fullName =
          `${entity.data.firstName || ""} ${
            entity.data.lastName || ""
          }`.trim() || "Unknown";
        missingMessages.push(
          `${role} (${fullName}) is missing: ${missingFields
            .map((field) => capitalizeAndSeparateCamelCase(field))
            .join(", ")}`
        );
      }
    } else if (entity.type === "office") {
      const billingValidation = validateBillingInfo(
        entity.data as Partial<User>
      );
      if (!billingValidation.isValid) {
        missingMessages.push(
          `${role} (${entity.data.location || "Office"}) is missing: ${
            billingValidation.missingFields
          }`
        );
      }
    }
  };

  // Validar origen (ubicación A)
  validateEntity(source, "Current holder");

  // Validar destino (ubicación B)
  validateEntity(
    destination,
    source?.type === "office" ? "Assigned location" : "Assigned member"
  );

  console.log("Missing Messages:", missingMessages);
  return missingMessages;
};

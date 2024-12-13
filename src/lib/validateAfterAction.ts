import {
  capitalizeAndSeparateCamelCase,
  getMissingFields,
  validateBillingInfo,
} from "@/lib/utils";
import { TeamMember, Product, User } from "@/types";

export const validateAfterAction = (source, destination): string[] => {
  const missingMessages: string[] = [];

  console.log("Validating source and destination...");

  // Validar origen (ubicación A)
  if (source) {
    if (source.type === "member" && source.data) {
      const missingFields = getMissingFields(source.data as TeamMember);
      if (missingFields.length > 0) {
        const fullName = `${(source.data as TeamMember).firstName} ${
          (source.data as TeamMember).lastName
        }`.trim();
        missingMessages.push(
          `Current holder (${fullName || "Unknown"}) is missing: ${missingFields
            .map((field) => capitalizeAndSeparateCamelCase(field))
            .join(", ")}`
        );
      }
    } else if (source.type === "office" && source.data) {
      const billingValidation = validateBillingInfo(
        source.data as Partial<User>
      );
      if (!billingValidation.isValid) {
        missingMessages.push(
          `Current holder (${source.data.location || "Office"}) is missing: ${
            billingValidation.missingFields
          }`
        );
      }
    }
  }

  // Validar destino (ubicación B)
  if (destination) {
    if (destination.type === "member" && destination.data) {
      const missingFields = getMissingFields(destination.data as TeamMember);
      if (missingFields.length > 0) {
        const fullName = `${(destination.data as TeamMember).firstName} ${
          (destination.data as TeamMember).lastName
        }`.trim();
        missingMessages.push(
          `Assigned member (${
            fullName || "Unknown"
          }) is missing: ${missingFields
            .map((field) => capitalizeAndSeparateCamelCase(field))
            .join(", ")}`
        );
      }
    } else if (destination.type === "office" && destination.data) {
      const billingValidation = validateBillingInfo(
        destination.data as Partial<User>
      );
      if (!billingValidation.isValid) {
        missingMessages.push(
          `Assigned location (${
            destination.data.location || "Office"
          }) is missing: ${billingValidation.missingFields}`
        );
      }
    }
  }

  console.log("Missing Messages:", missingMessages);
  return missingMessages;
};

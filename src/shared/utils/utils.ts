import { User } from "@/features/auth";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getMissingFields = (selectedMember: any): string[] => {
  if (!selectedMember || typeof selectedMember !== "object") {
    console.error("Invalid selectedMember provided:", selectedMember);
    return [];
  }
  const missingFields: string[] = [];

  const isEmptyString = (value: any) =>
    (typeof value === "string" && value.trim() === "") || value === undefined;

  const isInvalidNumber = (value: any) =>
    typeof value === "number" ? value === 0 : !value;
  if (isEmptyString(selectedMember.personalEmail)) {
    missingFields.push("personalEmail");
  }
  if (isEmptyString(selectedMember.phone)) {
    missingFields.push("phone");
  }
  if (isInvalidNumber(selectedMember.dni)) {
    missingFields.push("dni");
  }
  if (isEmptyString(selectedMember.country)) {
    missingFields.push("country");
  }
  if (isEmptyString(selectedMember.city)) {
    missingFields.push("city");
  }
  if (isEmptyString(selectedMember.zipCode)) {
    missingFields.push("zipCode");
  }
  if (isEmptyString(selectedMember.address)) {
    missingFields.push("address");
  }

  return missingFields;
};

export function capitalizeAndSeparateCamelCase(text: string) {
  const separated = text.replace(/([a-z])([A-Z])/g, "$1 $2");
  return separated.replace(/\b\w/g, (char) => char.toUpperCase());
}

export const validateBillingInfo = (
  user: Partial<User> | null | undefined
): { isValid: boolean; missingFields: string } => {
  if (!user || typeof user !== "object") {
    console.error("Invalid user provided:", user);
    return { isValid: false, missingFields: "User data is missing" };
  }

  const requiredFields = [
    "country",
    "city",
    "state",
    "zipCode",
    "address",
  ] as const;

  const missingFieldsArray = requiredFields.filter((field) => {
    const value = user[field];
    return typeof value !== "string" || value.trim() === "";
  });

  return {
    isValid: missingFieldsArray.length === 0,
    missingFields: missingFieldsArray.join(", "),
  };
};

export const formatMissingFieldsMessage = (
  missingFields: string[],
  context: string
): string => {
  const fields = missingFields
    .map((field) => capitalizeAndSeparateCamelCase(field))
    .join(", ");
  return `The assignment was completed successfully, but the following ${context} is missing: ${fields}. Please update the details to proceed with the shipment.`;
};

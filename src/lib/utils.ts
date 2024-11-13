import { User } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getMissingFields = (selectedMember: any): string[] => {
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
  user: User
): { isValid: boolean; missingFields: string } => {
  const requiredFields = [
    "country",
    "city",
    "state",
    "zipCode",
    "address",
  ] as const;

  const missingFieldsArray = requiredFields.filter(
    (field) => !user[field]?.trim()
  );

  return {
    isValid: missingFieldsArray.length === 0,
    missingFields: missingFieldsArray.join(", "),
  };
};

export const formatMissingFieldsMessage = (missingFields: string[]) => {
  return missingFields.reduce((acc, field, index) => {
    const fieldMessage = capitalizeAndSeparateCamelCase(field);
    return index === 0 ? fieldMessage : `${acc} - ${fieldMessage}`;
  }, "");
};

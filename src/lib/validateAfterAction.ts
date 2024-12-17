import { Product, TeamMember, User } from "@/types";
import { QueryClient } from "@tanstack/react-query";

const capitalizeAndSeparateCamelCase = (text: string): string => {
  const separated = text.replace(/([a-z])([A-Z])/g, "$1 $2");
  return separated.replace(/\b\w/g, (char) => char.toUpperCase());
};

const getMissingFields = (selectedMember: any): string[] => {
  if (!selectedMember || typeof selectedMember !== "object") {
    console.error("Invalid selectedMember provided:", selectedMember);
    return [];
  }

  const requiredFields = [
    "personalEmail",
    "phone",
    "dni",
    "country",
    "city",
    "zipCode",
    "address",
  ];
  const missingFields: string[] = [];

  requiredFields.forEach((field) => {
    const value = selectedMember[field as keyof TeamMember];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      missingFields.push(field);
    }
  });

  return missingFields;
};

const validateBillingInfo = (
  user: Partial<User> | null | undefined
): { isValid: boolean; missingFields: string } => {
  if (!user || typeof user !== "object") {
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

export const validateAfterAction = (
  source: {
    type: "member" | "office";
    data: TeamMember | Partial<User>;
  } | null,
  destination: {
    type: "member" | "office";
    data: TeamMember | Partial<User>;
  } | null
): string[] => {
  const missingMessages: string[] = [];

  const validateEntity = (
    entity: { type: "member" | "office"; data: any },
    role: "Current holder" | "Assigned member" | "Assigned location"
  ) => {
    if (!entity || !entity.data) return;

    if (
      entity.type === "office" &&
      entity.data.location &&
      entity.data.location === "FP warehouse"
    ) {
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

  if (source) {
    validateEntity(source, "Current holder");
  }

  if (destination) {
    validateEntity(
      destination,
      source?.type === "office" ? "Assigned location" : "Assigned member"
    );
  }

  return missingMessages;
};

export const buildValidationEntities = (
  product: Product,
  allMembers: TeamMember[] = [],
  selectedMember?: TeamMember | null,
  sessionUser?: Partial<User>
) => {
  let source: { type: "member" | "office"; data: any } | null = null;
  let destination: { type: "member" | "office"; data: any } | null = null;

  const currentHolder = allMembers.find(
    (member) => member.email === product.assignedEmail
  );

  if (currentHolder) {
    source = { type: "member", data: currentHolder };
  } else if (product.location === "Our office") {
    source = {
      type: "office",
      data: { location: "Our office", ...sessionUser },
    };
  }

  if (selectedMember) {
    destination = { type: "member", data: selectedMember };
  } else if (product.location === "Our office" || selectedMember === null) {
    destination = {
      type: "office",
      data: { location: "Our office", ...sessionUser },
    };
  }

  return { source, destination };
};

/* --------------------- Validate Product Assignment --------------------- */

interface ValidationResult {
  hasErrors: boolean;
  formattedMessages: string | null;
}

export const validateProductAssignment = (
  product: Product,
  finalAssignedEmail: string | undefined,
  selectedMember: TeamMember | null,
  queryClient: QueryClient,
  setGenericAlertData: (data: { title: string; description: string }) => void,
  setShowErrorDialog: (show: boolean) => void,
  sessionUser: Partial<User>
): ValidationResult => {
  const allMembers = queryClient.getQueryData<TeamMember[]>(["members"]);

  const { source, destination } = buildValidationEntities(
    product,
    allMembers || [],
    selectedMember,
    sessionUser
  );

  const missingMessages = validateAfterAction(source, destination);

  if (missingMessages.length > 0) {
    const formattedMessages = missingMessages
      .map(
        (message) =>
          `<div class="mb-2"><span>${message
            .replace(
              /Current holder \((.*?)\)/,
              "Current holder (<strong>$1</strong>)"
            )
            .replace(
              /Assigned member \((.*?)\)/,
              "Assigned member (<strong>$1</strong>)"
            )
            .replace(
              /Assigned location \((.*?)\)/,
              "Assigned location (<strong>$1</strong>)"
            )}</span></div>`
      )
      .join("");

    setGenericAlertData({
      title: "The update was completed successfully, but details are missing",
      description: formattedMessages,
    });
    setShowErrorDialog(true);

    return { hasErrors: true, formattedMessages };
  }

  return { hasErrors: false, formattedMessages: null };
};

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
  console.log("🔎 Validating Source:", source);
  console.log("🔎 Validating Destination:", destination);

  const validateEntity = (
    entity: { type: "member" | "office"; data: any },
    role: "Current holder" | "Assigned member" | "Assigned location"
  ) => {
    if (!entity || !entity.data) {
      console.log(`${role} is missing data:`, entity);
      return;
    }
    if (
      entity.type === "office" &&
      entity.data.location &&
      entity.data.location === "FP warehouse"
    ) {
      console.log(`${role} is FP warehouse, skipping validation.`);
      return;
    }

    if (entity.type === "member") {
      const missingFields = getMissingFields(entity.data as TeamMember);
      console.log(`${role} Missing Fields:`, missingFields);
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
      console.log(`${role} Billing Validation:`, billingValidation);
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
  console.log("✅ Final Missing Messages:", missingMessages);
  return missingMessages;
};

export const buildValidationEntities = (
  product: Product,
  allMembers: TeamMember[] = [],
  selectedMember?: TeamMember | null,
  sessionUser?: Partial<User>,
  noneOption?: string | null
) => {
  let source: { type: "member" | "office"; data: any } | null = null;
  let destination: { type: "member" | "office"; data: any } | null = null;

  // Source
  const currentMemberData = allMembers.find(
    (member) => member.email === product.assignedEmail
  );

  if (currentMemberData) {
    source = { type: "member", data: currentMemberData };
  } else if (product.assignedEmail) {
    source = {
      type: "member",
      data: {
        firstName: product.assignedMember?.split(" ")[0] || "",
        lastName: product.assignedMember?.split(" ")[1] || "",
        email: product.assignedEmail,
      },
    };
  } else if (product.location === "Our office") {
    source = {
      type: "office",
      data: { ...sessionUser, location: "Our office" },
    };
  }

  if (selectedMember) {
    console.log("✅ Selected Member Found:", selectedMember);
    destination = { type: "member", data: selectedMember };
  } else if (noneOption) {
    destination = {
      type: "office",
      data: { ...sessionUser, location: noneOption },
    };
  } else if (product.location === "Our office") {
    destination = {
      type: "office",
      data: { ...sessionUser, location: "Our office" },
    };
  }

  console.log("🔎 Source Entity:", source);
  console.log("🔎 Destination Entity:", destination);

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
  sessionUser: Partial<User>,
  noneOption: string | null
): ValidationResult => {
  const allMembers = queryClient.getQueryData<TeamMember[]>(["members"]);

  const { source, destination } = buildValidationEntities(
    product,
    allMembers || [],
    selectedMember,
    sessionUser,
    noneOption
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

import { Product } from "@/features/assets";
import { User } from "@/features/auth";
import { QueryClient } from "@tanstack/react-query";
import { Member } from "@/features/members";
import { OfficeServices } from "@/features/settings/services/office.services";
import { Office } from "@/features/settings/types/settings.types";

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
    const value = selectedMember[field as keyof Member];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      missingFields.push(field);
    }
  });

  return missingFields;
};

const validateOfficeInfo = async (): Promise<{
  isValid: boolean;
  missingFields: string;
}> => {
  try {
    const office = await OfficeServices.getDefaultOffice();

    const requiredFields = [
      "country",
      "city",
      "state",
      "zipCode",
      "address",
      "phone",
    ] as const;

    const missingFieldsArray = requiredFields.filter((field) => {
      const value = office[field];
      return typeof value !== "string" || value.trim() === "";
    });

    return {
      isValid: missingFieldsArray.length === 0,
      missingFields: missingFieldsArray.join(", "),
    };
  } catch (error) {
    console.error("Error fetching office data:", error);
    return { isValid: false, missingFields: "Office data unavailable" };
  }
};

export const validateAfterAction = async (
  source: {
    type: "member" | "office" | "warehouse";
    data: Member | Partial<User>;
  } | null,
  destination: {
    type: "member" | "office" | "warehouse";
    data: Member | Partial<User>;
  } | null
): Promise<string[]> => {
  const missingMessages: string[] = [];

  const validateEntity = async (
    entity: { type: "member" | "office" | "warehouse"; data: any },
    role: "Current holder" | "Assigned member" | "Assigned location"
  ) => {
    if (!entity || !entity.data) {
      return;
    }

    if (entity.type === "warehouse") {
      return;
    }

    if (entity.type === "office" && entity.data.location === "Our office") {
      // Usar la nueva función que obtiene datos de la oficina
      const officeValidation = await validateOfficeInfo();

      if (!officeValidation.isValid) {
        missingMessages.push(
          `${role} (${entity.data.location || "Office"}) is missing: ${
            officeValidation.missingFields
          }`
        );
      }
      return;
    }

    if (entity.type === "member") {
      const missingFields = getMissingFields(entity.data as Member);

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
    }
  };
  if (!source) {
    console.error("Source entity is undefined. Validation skipped.");
    return;
  }

  if (source) {
    await validateEntity(source, "Current holder");
  }

  if (destination) {
    await validateEntity(
      destination,
      destination?.type === "office" ? "Assigned location" : "Assigned member"
    );
  }

  return missingMessages;
};

export const buildValidationEntities = (
  product: Product,
  allMembers: Member[] = [],
  selectedMember?: Member | null,
  sessionUser?: Partial<User>,
  noneOption?: string | null
) => {
  let source: { type: "member" | "office" | "warehouse"; data: any } | null =
    null;
  let destination: {
    type: "member" | "office" | "warehouse";
    data: any;
  } | null = null;
  // Determinar `source`
  const currentMemberData = allMembers.find(
    (member) => member.email === product.assignedEmail
  );

  if (!currentMemberData) {
    console.warn(
      `No member found for email ${product.assignedEmail}. Check the member data or product assignment.`
    );
    return { source: null, destination: null };
  }

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
  } else if (product.location === "FP warehouse") {
    source = {
      type: "warehouse",
      data: { location: "FP warehouse" },
    };
  } else if (product.location === "Our office") {
    source = {
      type: "office",
      data: { ...sessionUser, location: "Our office" },
    };
  }

  // Determinar `destination`
  if (selectedMember) {
    destination = { type: "member", data: selectedMember };
  } else if (noneOption === "FP warehouse") {
    destination = { type: "warehouse", data: { location: "FP warehouse" } };
  } else if (noneOption === "Our office") {
    destination = {
      type: "office",
      data: { ...sessionUser, location: "Our office" },
    };
  }

  return { source, destination };
};

/* --------------------- Validate Product Assignment --------------------- */

interface ValidationResult {
  hasErrors: boolean;
  formattedMessages: string | null;
}

export const validateProductAssignment = async (
  product: Product,
  finalAssignedEmail: string | undefined,
  selectedMember: Member | null,
  queryClient: QueryClient,
  setGenericAlertData: (data: { title: string; description: string }) => void,
  setShowErrorDialog: (show: boolean) => void,
  sessionUser: Partial<User>,
  noneOption: string | null
): Promise<ValidationResult> => {
  const allMembers = queryClient.getQueryData<Member[]>(["members"]);

  const { source, destination } = buildValidationEntities(
    product,
    allMembers || [],
    selectedMember,
    sessionUser,
    noneOption
  );

  const missingMessages = await validateAfterAction(source, destination);

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

/* --------------------- Validate OnCreate --------------------- */

export const validateOnCreate = async (
  selectedMember: Member | null,
  sessionUser: Partial<User>,
  noneOption: string | null
): Promise<string[]> => {
  const missingMessages: string[] = [];

  if (noneOption === "FP warehouse") {
    return missingMessages;
  }

  if (selectedMember) {
    const missingFields = getMissingFields(selectedMember);
    if (missingFields.length > 0) {
      missingMessages.push(
        `Assigned member (<strong>${selectedMember.firstName} ${
          selectedMember.lastName
        }</strong>) is missing: ${missingFields
          .map(capitalizeAndSeparateCamelCase)
          .join(", ")}`
      );
    }
  } else if (noneOption === "Our office") {
    // Usar la nueva función que obtiene datos de la oficina
    const officeValidation = await validateOfficeInfo();
    if (!officeValidation.isValid) {
      missingMessages.push(
        `Assigned location (<strong>${noneOption}</strong>) is missing: ${officeValidation.missingFields}`
      );
    }
  }

  return missingMessages;
};

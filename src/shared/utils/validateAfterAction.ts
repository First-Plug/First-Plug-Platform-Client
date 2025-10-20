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

  // Función para validar members (síncrona) - RETORNA mensajes
  const validateMember = (
    entity: { type: "member"; data: Member },
    role: "Current holder" | "Assigned member"
  ): string[] => {
    const memberMessages: string[] = [];
    const missingFields = getMissingFields(entity.data);

    if (missingFields.length > 0) {
      const fullName =
        `${entity.data.firstName || ""} ${entity.data.lastName || ""}`.trim() ||
        "Unknown";

      memberMessages.push(
        `${role} (${fullName}) is missing: ${missingFields
          .map((field) => capitalizeAndSeparateCamelCase(field))
          .join(", ")}`
      );
    }

    return memberMessages;
  };

  // Función para validar office (asíncrona) - RETORNA mensajes
  const validateOffice = async (
    entity: { type: "office"; data: any },
    role: "Assigned location"
  ): Promise<string[]> => {
    const officeMessages: string[] = [];
    const officeValidation = await validateOfficeInfo();

    if (!officeValidation.isValid) {
      officeMessages.push(
        `${role} (${entity.data.location || "Office"}) is missing: ${
          officeValidation.missingFields
        }`
      );
    }

    return officeMessages;
  };

  if (!source) {
    console.error("Source entity is undefined. Validation skipped.");
    return missingMessages;
  }

  // Recopilar TODOS los mensajes de validación
  const allValidationPromises: Promise<string[]>[] = [];

  // Validar SOURCE
  if (source) {
    if (source.type === "member") {
      // Member validation es síncrona, la convertimos a Promise
      const memberMessages = validateMember(
        source as { type: "member"; data: Member },
        "Current holder"
      );
      allValidationPromises.push(Promise.resolve(memberMessages));
    } else if (source.type === "office") {
      // Office validation es asíncrona - validar cualquier oficina
      allValidationPromises.push(
        validateOffice(
          source as { type: "office"; data: any },
          "Assigned location"
        )
      );
    }
  }

  // Validar DESTINATION
  if (destination) {
    if (destination.type === "member") {
      // Member validation es síncrona, la convertimos a Promise
      const memberMessages = validateMember(
        destination as { type: "member"; data: Member },
        "Assigned member"
      );
      allValidationPromises.push(Promise.resolve(memberMessages));
    } else if (destination.type === "office") {
      // Office validation es asíncrona - validar cualquier oficina
      allValidationPromises.push(
        validateOffice(
          destination as { type: "office"; data: any },
          "Assigned location"
        )
      );
    }
  }

  // Esperar a que TODAS las validaciones terminen
  const allResults = await Promise.all(allValidationPromises);

  // Combinar TODOS los mensajes en un solo array
  allResults.forEach((messages) => {
    missingMessages.push(...messages);
  });

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
  } else if (product.location && product.location !== "Employee") {
    // Si el location no es "Employee", es una oficina
    source = {
      type: "office",
      data: { ...sessionUser, location: product.location },
    };
  }

  // Determinar `destination`
  if (selectedMember) {
    destination = { type: "member", data: selectedMember };
  } else if (noneOption && noneOption !== "Employee") {
    // Si noneOption no es "Employee", es una oficina
    destination = {
      type: "office",
      data: { ...sessionUser, location: noneOption },
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
  } else if (noneOption && noneOption !== "Employee") {
    // Si noneOption no es "Employee", es una oficina - validar datos de la oficina
    const officeValidation = await validateOfficeInfo();
    if (!officeValidation.isValid) {
      missingMessages.push(
        `Assigned location (<strong>${noneOption}</strong>) is missing: ${officeValidation.missingFields}`
      );
    }
  }

  return missingMessages;
};

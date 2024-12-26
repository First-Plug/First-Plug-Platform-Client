import { SlackNotificationPayload } from "@/services/slackNotifications.services";
import { Product, TeamMember, User } from "@/types";

export interface ValidationEntity {
  type: "member" | "office";
  data:
    | TeamMember
    | (Partial<User> & { location?: string; state?: string })
    | null;
}

export const prepareSlackNotificationPayload = (
  currentProduct: Product,
  selectedMember: TeamMember | null,
  session: any,
  actionLabel: string,
  source: ValidationEntity | null,
  noneOption: string | null,
  tenantName: string
): SlackNotificationPayload => {
  const logData = (label: string, data: any) => {
    console.log(`${label}:`, data);
  };

  const brandAttribute = currentProduct.attributes.find(
    (attr) => attr.key === "brand"
  );
  const modelAttribute = currentProduct.attributes.find(
    (attr) => attr.key === "model"
  );

  const brand = brandAttribute?.value || "N/A";
  const model = modelAttribute?.value || "N/A";

  if (actionLabel === "Create Product") {
    logData(
      "Action is Create Product. Using simplified logic for 'from' and 'to'.",
      null
    );

    // Priorizar selectedMember
    const to = selectedMember
      ? {
          name: `${selectedMember.firstName} ${selectedMember.lastName}`,
          address: selectedMember.address || "Dirección no especificada",
          apartment: selectedMember.apartment || "Apartamento no especificado",
          zipCode: selectedMember.zipCode || "Código postal no especificado",
          city: selectedMember.city || "Ciudad no especificada",
          state: "",
          country: selectedMember.country || "País no especificado",
          phone: selectedMember.phone || "Teléfono no especificado",
          email: selectedMember.email || "Correo no especificado",
        }
      : noneOption === "Our office" && source?.data
      ? {
          name: "Oficina del cliente",
          address: source.data.address || "Dirección no especificada",
          apartment: source.data.apartment || "Apartamento no especificado",
          zipCode: source.data.zipCode || "Código postal no especificado",
          city: source.data.city || "Ciudad no especificada",
          state: "state" in source.data ? source.data.state || "" : "",
          country: source.data.country || "País no especificado",
          phone: source.data.phone || "Teléfono no especificado",
          email: source.data.email || "Correo no especificado",
        }
      : {
          name: "FP warehouse",
          address: "",
          apartment: "",
          zipCode: "",
          city: "",
          state: "",
          country: "",
          phone: "",
          email: "",
        };

    const payload: SlackNotificationPayload = {
      from: {
        name: "N/A",
        address: "",
        apartment: "",
        zipCode: "",
        city: "",
        state: "",
        country: "",
        phone: "",
        email: "",
      },
      to,
      products: [
        {
          category: currentProduct.category,
          brand,
          model,
          name: currentProduct.name || "N/A",
          serialNumber: currentProduct.serialNumber || "N/A",
        },
      ],
      tenantName,
      action: actionLabel,
    };

    logData("Slack Payload for Create Product", payload);
    return payload;
  }

  // Lógica para "Update Product"
  logData(
    "Action is Update Product. Using full logic for 'from' and 'to'.",
    null
  );

  // Inicializar "from"
  let from = {
    name: "N/A",
    address: "",
    apartment: "",
    zipCode: "",
    city: "",
    state: "",
    country: "",
    phone: "",
    email: "",
  };

  if (source) {
    if (source.type === "member") {
      const memberData = source.data as TeamMember;
      from = {
        name: `${memberData.firstName || "N/A"} ${
          memberData.lastName || "N/A"
        }`,
        address: memberData.address || "",
        apartment: memberData.apartment || "",
        zipCode: memberData.zipCode || "",
        city: memberData.city || "",
        state: "",
        country: memberData.country || "",
        phone: memberData.phone || "",
        email: memberData.email || "",
      };
    } else if (source.type === "office") {
      const officeData = source.data as Partial<User> & { location?: string };
      const isOurOffice = officeData?.location === "Our office";

      from = {
        name: isOurOffice ? "Oficina del cliente" : "FP warehouse",
        address: officeData.address || "",
        apartment: officeData.apartment || "",
        zipCode: officeData.zipCode || "",
        city: officeData.city || "",
        state: officeData.state || "",
        country: officeData.country || "",
        phone: officeData.phone || "",
        email: officeData.email || "",
      };
    }
  }

  // Inicializar "to"
  let to = {
    name: "N/A",
    address: "",
    apartment: "",
    zipCode: "",
    city: "",
    state: "",
    country: "",
    phone: "",
    email: "",
  };

  if (selectedMember) {
    to = {
      name: `${selectedMember.firstName} ${selectedMember.lastName}`,
      address: selectedMember.address || "",
      apartment: selectedMember.apartment || "",
      zipCode: selectedMember.zipCode || "",
      city: selectedMember.city || "",
      state: "",
      country: selectedMember.country || "",
      phone: selectedMember.phone || "",
      email: selectedMember.email || "",
    };
  } else if (noneOption === "Our office" && source?.data) {
    to = {
      name: "Oficina del cliente",
      address: source.data.address || "",
      apartment: source.data.apartment || "",
      zipCode: source.data.zipCode || "",
      city: source.data.city || "",
      state: "state" in source.data ? source.data.state || "" : "",
      country: source.data.country || "",
      phone: source.data.phone || "",
      email: source.data.email || "",
    };
  } else if (noneOption === "FP warehouse") {
    to = {
      name: "FP warehouse",
      address: "",
      apartment: "",
      zipCode: "",
      city: "",
      state: "",
      country: "",
      phone: "",
      email: "",
    };
  }

  const payload: SlackNotificationPayload = {
    from,
    to,
    products: [
      {
        category: currentProduct.category,
        brand,
        model,
        name: currentProduct.name || "N/A",
        serialNumber: currentProduct.serialNumber || "N/A",
      },
    ],
    tenantName,
    action: actionLabel,
  };

  logData("Slack Payload for Update Product", payload);
  return payload;
};

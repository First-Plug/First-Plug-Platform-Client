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
  // session: any,
  actionLabel: string,
  source: ValidationEntity | null,
  noneOption: string | null,
  tenantName: string,
  sessionUser: any
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

  const productLocation = currentProduct.location || "N/A";

  const brand = brandAttribute?.value || "N/A";
  const model = modelAttribute?.value || "N/A";

  if (actionLabel === "Create Product") {
    // Priorizar selectedMember
    const to = selectedMember
      ? {
          name: `${selectedMember.firstName} ${selectedMember.lastName}`,
          address: selectedMember.address || "N/A",
          apartment: selectedMember.apartment || "N/A",
          zipCode: selectedMember.zipCode || "N/A",
          city: selectedMember.city || "N/A",
          state: "",
          country: selectedMember.country || "N/A",
          phone: selectedMember.phone || "N/A",
          email: selectedMember.email || "N/A",
          personalEmail: selectedMember.personalEmail || "N/A",
          dni: selectedMember?.dni ? selectedMember.dni.toString() : "N/A",
        }
      : noneOption === "Our office" && source?.data
      ? {
          name: "Oficina del cliente",
          address: source.data.address || "N/A",
          apartment: source.data.apartment || "N/A",
          zipCode: source.data.zipCode || "N/A",
          city: source.data.city || "N/A",
          state: "state" in source.data ? source.data.state || "" : "",
          country: source.data.country || "N/A",
          phone: source.data.phone || "N/A",
          email: source.data.email || "N/A",
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
        personalEmail: "",
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

    return payload;
  }

  //update product
  // Inicializar "from"
  let from: {
    name: string;
    address: string;
    apartment: string;
    zipCode: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    personalEmail?: string;
    dni: string;
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
        personalEmail: memberData.personalEmail || "",
        dni: memberData.dni ? memberData.dni.toString() : "N/A",
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
        dni: "",
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
    personalEmail: "",
    dni: "",
  };

  if (selectedMember) {
    to = {
      name: `${selectedMember.firstName} ${selectedMember.lastName}`,
      address: selectedMember.address || "N/A",
      apartment: selectedMember.apartment || "N/A",
      zipCode: selectedMember.zipCode || "N/A",
      city: selectedMember.city || "N/A",
      state: "",
      country: selectedMember.country || "N/A",
      phone: selectedMember.phone || "N/A",
      email: selectedMember.email || "N/A",
      personalEmail: selectedMember.personalEmail || "N/A",
      dni: selectedMember.dni ? selectedMember.dni.toString() : "N/A",
    };
  } else if (currentProduct.location === "Our office") {
    to = {
      name: "Oficina del cliente",
      address: sessionUser.address || "N/A",
      apartment: sessionUser.apartment || "N/A",
      zipCode: sessionUser.zipCode || "N/A",
      city: sessionUser.city || "N/A",
      state: sessionUser.state || "N/A",
      country: sessionUser.country || "N/A",
      phone: sessionUser.phone || "N/A",
      email: sessionUser.email || "N/A",
      personalEmail: sessionUser.personalEmail || "N/A",
      dni: "N/A",
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
      personalEmail: "",
      dni: "",
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

  return payload;
};

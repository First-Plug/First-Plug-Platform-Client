import { SlackNotificationPayload } from "@/services/slackNotifications.services";
import { Product, TeamMember, User } from "@/types";

export interface ValidationEntity {
  type: "member" | "office";
  data: TeamMember | (Partial<User> & { location?: string }) | null;
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

  logData("Current Product", currentProduct);
  logData("Selected Member", selectedMember);
  logData("Session", session);
  logData("Source", source);
  logData("None Option", noneOption);

  const brandAttribute = currentProduct.attributes.find(
    (attr) => attr.key === "brand"
  );
  const modelAttribute = currentProduct.attributes.find(
    (attr) => attr.key === "model"
  );

  const brand = brandAttribute?.value || "N/A";
  const model = modelAttribute?.value || "N/A";

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

  // Configurar "from" basado en el source
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
  const hasState = (
    data: any
  ): data is Partial<User> & { location?: string; state?: string } => {
    return data && "state" in data;
  };

  // Configurar "to" basado en selectedMember o noneOption
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
  } else if (noneOption === "Our office" && hasState(source.data)) {
    to = {
      name: "Oficina del cliente",
      address: source.data.address || "",
      apartment: source.data.apartment || "",
      zipCode: source.data.zipCode || "",
      city: source.data.city || "",
      state: source.data.state || "",
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

  // Retornar el payload de Slack
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

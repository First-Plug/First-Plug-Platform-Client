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
  const brandAttribute = currentProduct.attributes.find(
    (attr) => attr.key === "brand"
  );
  const modelAttribute = currentProduct.attributes.find(
    (attr) => attr.key === "model"
  );

  const brand = brandAttribute?.value || "N/A";
  const model = modelAttribute?.value || "N/A";

  const logData = (label: string, data: any) => {
    console.log(`${label}:`, data);
  };

  // Inicializar "from"
  let from = {
    name: "N/A",
    address: "",
    apartment: "",
    zipCode: "",
    city: "",
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
        country: memberData.country || "",
        phone: memberData.phone || "",
        email: memberData.email || "",
      };
    } else if (source.type === "office") {
      const officeData = source.data as Partial<User> & { location?: string };
      const isOurOffice = officeData?.location === "Our office";

      from = {
        name: isOurOffice ? "Oficina del cliente" : "FP warehouse",
        address: isOurOffice ? session?.user?.address || "" : "",
        apartment: isOurOffice ? session?.user?.apartment || "" : "",
        zipCode: isOurOffice ? session?.user?.zipCode || "" : "",
        city: isOurOffice ? session?.user?.city || "" : "",
        country: isOurOffice ? session?.user?.country || "" : "",
        phone: isOurOffice ? session?.user?.phone || "" : "",
        email: isOurOffice ? session?.user?.email || "" : "",
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
    country: "",
    phone: "",
    email: "",
  };

  // Configurar "to" basado en selectedMember o noneOption
  if (selectedMember) {
    to = {
      name: `${selectedMember.firstName} ${selectedMember.lastName}`,
      address: selectedMember.address || "",
      apartment: selectedMember.apartment || "",
      zipCode: selectedMember.zipCode || "",
      city: selectedMember.city || "",
      country: selectedMember.country || "",
      phone: selectedMember.phone || "",
      email: selectedMember.email || "",
    };
  } else if (noneOption === "Our office") {
    to = {
      name: "Oficina del cliente",
      address: session?.user?.address || "",
      apartment: session?.user?.apartment || "",
      zipCode: session?.user?.zipCode || "",
      city: session?.user?.city || "",
      country: session?.user?.country || "",
      phone: session?.user?.phone || "",
      email: session?.user?.email || "",
    };
  } else if (noneOption === "FP warehouse") {
    to = {
      name: "FP warehouse",
      address: "",
      apartment: "",
      zipCode: "",
      city: "",
      country: "",
      phone: "",
      email: "",
    };
  }

  // Retornar el payload de Slack
  return {
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
};

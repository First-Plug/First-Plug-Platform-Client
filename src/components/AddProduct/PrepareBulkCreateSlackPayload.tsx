import { SlackNotificationPayload } from "@/services/slackNotifications.services";
import { TeamMember, User } from "@/types";

export const prepareBulkCreateSlackPayload = (
  products: {
    assignedMember: {
      firstName: string;
      lastName: string;
      email: string;
    } | null;
    assignedEmail: string;
    location: string;
    serialNumber: string;
  }[],
  initialData: {
    name: string;
    category: string;
    attributes: { key: string; value: string }[];
  },
  tenantName: string,
  sessionUser: User,
  members: TeamMember[]
): SlackNotificationPayload[] => {
  const commonAttributes = initialData.attributes.reduce((acc, attr) => {
    acc[attr.key] = attr.value || "N/A";
    return acc;
  }, {} as Record<string, string>);

  const generateToField = (
    product: (typeof products)[number]
  ): SlackNotificationPayload["to"] => {
    // Si hay un miembro asignado directamente
    if (product.assignedMember) {
      const member = members.find((m) => m.email === product.assignedEmail);
      return {
        name: `${member?.firstName || "N/A"} ${member?.lastName || "N/A"}`,
        address: member?.address || "Dirección no especificada",
        apartment: member?.apartment || "Apartamento no especificado",
        zipCode: member?.zipCode || "Código postal no especificado",
        city: member?.city || "Ciudad no especificada",
        country: member?.country || "País no especificado",
        phone: member?.phone || "Teléfono no especificado",
        email: member?.email || "Correo no especificado",
      };
    }

    // Si es "Our office"
    if (product.location === "Our office") {
      return {
        name: "Oficina del cliente",
        address: sessionUser.address || "Dirección no especificada",
        apartment: sessionUser.apartment || "Apartamento no especificado",
        zipCode: sessionUser.zipCode || "Código postal no especificado",
        city: sessionUser.city || "Ciudad no especificada",
        state: sessionUser.state || "",
        country: sessionUser.country || "País no especificado",
        phone: sessionUser.phone || "Teléfono no especificado",
        email: sessionUser.email || "Correo no especificado",
      };
    }

    // Si es "FP warehouse"
    return {
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
  };

  // Generar el payload por producto
  const payloads = products.map((product) => {
    const to = generateToField(product);

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
          category: initialData.category,
          brand: commonAttributes["brand"],
          model: commonAttributes["model"],
          name: initialData.name || "N/A",
          serialNumber: product.serialNumber || "N/A",
        },
      ],
      tenantName,
      action: "Bulk Create Products",
    };

    return payload;
  });

  return payloads;
};

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
    if (product.assignedMember) {
      const member = members.find((m) => m.email === product.assignedEmail);
      return {
        name: `${member?.firstName || "N/A"} ${member?.lastName || "N/A"}`,
        address: member?.address || "N/A",
        apartment: member?.apartment || "N/A",
        zipCode: member?.zipCode || "N/A",
        city: member?.city || "N/A",
        country: member?.country || "N/A",
        phone: member?.phone || "N/A",
        email: member?.email || "N/A",
        personalEmail: member?.personalEmail || "N/A",
        dni: member?.dni ? member.dni.toString() : "N/A",
      };
    }

    if (product.location === "Our office") {
      return {
        name: "Oficina del cliente",
        address: sessionUser.address || "N/A",
        apartment: sessionUser.apartment || "N/A",
        zipCode: sessionUser.zipCode || "N/A",
        city: sessionUser.city || "N/A",
        state: sessionUser.state || "",
        country: sessionUser.country || "N/A",
        phone: sessionUser.phone || "N/A",
        email: sessionUser.email || "N/A",
      };
    }

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

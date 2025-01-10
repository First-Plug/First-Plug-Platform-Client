import { SlackNotificationPayload } from "@/services/slackNotifications.services";

export const prepareBulkCreateSlackPayload = (
  products,
  initialData,
  tenantName,
  sessionUser,
  members
): SlackNotificationPayload[] => {
  const commonAttributes = initialData.attributes.reduce((acc, attr) => {
    acc[attr.key] = attr.value || "N/A";
    return acc;
  }, {});

  const assignments = products.reduce((acc, product) => {
    const normalizedEmail = product.assignedEmail?.trim().toLowerCase();

    let assignmentKey;
    let assignmentDetails;

    if (normalizedEmail) {
      const member = members.find(
        (m) => m.email.trim().toLowerCase() === normalizedEmail
      );

      if (member) {
        assignmentKey = `member-${member.email}`;
        assignmentDetails = {
          name: `${member.firstName || "N/A"} ${member.lastName || "N/A"}`,
          address: member.address || "N/A",
          apartment: member.apartment || "N/A",
          zipCode: member.zipCode || "N/A",
          city: member.city || "N/A",
          country: member.country || "N/A",
          phone: member.phone || "N/A",
          email: member.email || "N/A",
          personalEmail: member.personalEmail || "N/A",
          dni: member.dni ? member.dni.toString() : "N/A",
        };
      }
    }

    if (!assignmentDetails) {
      if (product.location === "Our office") {
        assignmentKey = "office";
        assignmentDetails = {
          name: "Oficina del cliente",
          address: sessionUser.address || "N/A",
          apartment: sessionUser.apartment || "N/A",
          zipCode: sessionUser.zipCode || "N/A",
          city: sessionUser.city || "N/A",
          state: sessionUser.state || "N/A",
          country: sessionUser.country || "N/A",
          phone: sessionUser.phone || "N/A",
          email: sessionUser.email || "N/A",
        };
      } else {
        assignmentKey = "warehouse";
        assignmentDetails = {
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
    }

    if (!acc[assignmentKey]) {
      acc[assignmentKey] = {
        ...assignmentDetails,
        serialNumbers: [],
        quantity: 0,
      };
    }

    acc[assignmentKey].serialNumbers.push(product.serialNumber || "N/A");
    acc[assignmentKey].quantity += 1;

    return acc;
  }, {});

  return Object.values(assignments).map((assignment: any) => ({
    tenantName,
    action: "BulkCreate Assets",
    products: [
      {
        category: initialData.category,
        brand: commonAttributes["brand"],
        model: commonAttributes["model"],
        name: initialData.name || "N/A",
        quantity: assignment.quantity,
      },
    ],
    to: {
      name: assignment.name || "N/A",
      address: assignment.address || "N/A",
      apartment: assignment.apartment || "N/A",
      zipCode: assignment.zipCode || "N/A",
      city: assignment.city || "N/A",
      state: assignment.state || "N/A",
      country: assignment.country || "N/A",
      phone: assignment.phone || "N/A",
      email: assignment.email || "N/A",
      personalEmail: assignment.personalEmail || "N/A",
      dni: assignment.dni || "N/A",
    },
  }));
};

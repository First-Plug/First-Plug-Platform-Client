import { Category, ProductFormData } from "@/features/assets";

export const handleCategoryChange = (
  category: Category,
  setValue: (name: string, value: any) => void
) => {
  const defaultProduct = {
    _id: "",
    name: "",
    category: undefined,
    attributes: [],
    status: "Available",
    productCondition: "Optimal",
    deleted: false,
    recoverable: true,
    acquisitionDate: "",
    createdAt: "",
    updatedAt: "",
    deletedAt: "",
    serialNumber: "",
    location: undefined,
    assignedEmail: undefined,
    assignedMember: undefined,
    lastAssigned: "",
    price: undefined,
    additionalInfo: "",
    fp_shipment: false,
    desirableDate: {
      origin: "",
      destination: "",
    },
    shipmentOrigin: "",
    shipmentDestination: "",
    shipmentId: "",
    origin: "",
    activeShipment: false,
  };

  setValue("category", category);
  setValue("attributes", []);
  setValue("name", "");
  setValue("serialNumber", "");
  setValue("location", undefined);
  setValue("assignedEmail", undefined);
  setValue("assignedMember", undefined);
  setValue("price", undefined);
  setValue("additionalInfo", "");
  setValue("productCondition", "Optimal");
  setValue("recoverable", true);
  setValue("deleted", false);
  setValue("fp_shipment", false);
  setValue("desirableDate", {
    origin: "",
    destination: "",
  });
  setValue("shipmentOrigin", "");
  setValue("shipmentDestination", "");
  setValue("shipmentId", "");
  setValue("origin", "");
  setValue("activeShipment", false);
};

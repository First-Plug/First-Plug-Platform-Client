import { type ProductTable, type Product } from "@/features/assets";

export const transformData = (rawData: any[]): ProductTable[] => {
  const groupedData: Record<string, ProductTable> = {};

  rawData.forEach((item) => {
    const product = {
      _id: item._id,
      name: item.name || null,
      category: item.category,
      attributes: item.attributes || [],
      status: item.status || "Available",
      deleted: item.deleted || false,
      recoverable: item.recoverable ?? true,
      acquisitionDate: item.acquisitionDate || "",
      createdAt: item.createdAt || "",
      updatedAt: item.updatedAt || "",
      deletedAt: item.deletedAt || null,
      location: item.location || "Unknown",
      officeId: item.officeId || undefined,
      officeName: item.officeName || undefined,
      assignedEmail: item.assignedEmail || "",
      assignedMember: item.assignedMember || "",
      serialNumber: item.serialNumber || null,
      lastAssigned: item.lastAssigned || null,
    };

    if (!groupedData[item.category]) {
      groupedData[item.category] = {
        category: item.category,
        products: [],
      };
    }

    groupedData[item.category].products.push(product as Product);
  });

  return Object.values(groupedData);
};

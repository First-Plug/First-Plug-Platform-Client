import {
  AttributeModel,
  Category,
  emptyProduct,
  Key,
  Product,
  ProductTable,
} from "@/types";
import { cast } from "mobx-state-tree";

export const transformData = (rawData: any[]): ProductTable[] => {
  const groupedData: Record<string, ProductTable> = {};

  rawData.forEach((item) => {
    const product = {
      _id: item._id,
      name: item.name || null,
      category: item.category,
      attributes: cast(item.attributes || []),
      status: item.status || "Available",
      deleted: item.deleted || false,
      recoverable: item.recoverable ?? true,
      acquisitionDate: item.acquisitionDate || "",
      createdAt: item.createdAt || "",
      updatedAt: item.updatedAt || "",
      deletedAt: item.deletedAt || null,
      location: item.location || "Unknown",
      assignedEmail: item.assignedEmail || "",
      assignedMember: item.assignedMember || "",
      serialNumber: item.serialNumber || null,
      lastAssigned: item.lastAssigned || null,
    };

    if (!groupedData[item.category]) {
      groupedData[item.category] = {
        category: item.category,
        products: cast([]),
      };
    }

    groupedData[item.category].products.push(product);
  });

  return Object.values(groupedData);
};

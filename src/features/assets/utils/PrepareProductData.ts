import { Product, ProductFormData, Category, Atrribute } from "@/types";
import { cast } from "mobx-state-tree";
import { AttributeModel } from "@/types";

export const prepareProductData = (
  data: ProductFormData,
  isUpdate: boolean,
  selectedCategory: Category | undefined,
  initialData: Product | undefined,
  attributes: Atrribute[],
  recoverable: boolean,
  amount?: number,
  assignedEmail?: string
): Product => {
  const preparedData: Partial<Product> = {
    ...data,
    assignedEmail:
      assignedEmail === "None" || assignedEmail === "" ? "" : assignedEmail,
    price:
      amount !== undefined
        ? { amount, currencyCode: data.price?.currencyCode || "USD" }
        : undefined,
    recoverable,
    status: assignedEmail || data.assignedMember ? "Delivered" : "Available",
    category: selectedCategory || initialData?.category || "Other",
    location: data.location || initialData?.location,
    name: data.name || initialData?.name || "",
    attributes: cast(
      attributes.map((attr) => {
        const initialAttr = initialData?.attributes.find(
          (ia) => ia.key === attr.key
        );
        return {
          ...AttributeModel.create(attr),
          value:
            attr.value !== ""
              ? attr.value
              : initialAttr
              ? initialAttr.value
              : attr.value,
        };
      })
    ),
    ...(data.serialNumber?.trim()
      ? { serialNumber: data.serialNumber.trim() }
      : {}),
  };

  if (isUpdate && initialData) {
    Object.keys(preparedData).forEach((key) => {
      if (
        preparedData[key] === initialData[key] &&
        key !== "category" &&
        key !== "location" &&
        key !== "status"
      ) {
        delete preparedData[key];
      }
    });
  }

  return preparedData as Product;
};

import { Product, Category, Attribute } from "@/features/assets";

export const prepareProductData = (
  data: Product,
  isUpdate: boolean,
  selectedCategory: Category | undefined,
  initialData: Product | undefined,
  attributes: Attribute[],
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
    attributes: attributes.map((attr) => {
      const initialAttr = initialData?.attributes.find(
        (ia) => ia.key === attr.key
      );
      return {
        ...attr,
        value:
          attr.value !== ""
            ? attr.value
            : initialAttr
            ? initialAttr.value
            : attr.value,
      };
    }),
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

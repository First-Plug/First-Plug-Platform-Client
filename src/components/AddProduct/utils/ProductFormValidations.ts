import {
  FieldValues,
  UseFormClearErrors,
  UseFormReturn,
  UseFormSetError,
  UseFormTrigger,
  UseFormWatch,
} from "react-hook-form";
import { Product, Category, Atrribute, ProductFormData } from "@/types";

export const validateCategory = async (
  trigger: UseFormTrigger<ProductFormData>
): Promise<boolean> => {
  const isCategoryValid = await trigger("category");
  return isCategoryValid;
};

export const validateAttributes = (
  attributes: Atrribute[],
  category: Category,
  setCustomErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
): boolean => {
  let hasError = false;
  const newErrors: Record<string, string> = {};

  if (category !== "Merchandising") {
    const brand = attributes.find((attr) => attr.key === "brand")?.value;
    const model = attributes.find((attr) => attr.key === "model")?.value;

    if (!brand) {
      newErrors["brand"] = "Brand is required.";
      hasError = true;
    }

    if (!model) {
      newErrors["model"] = "Model is required.";
      hasError = true;
    }
  }

  setCustomErrors(newErrors);
  return !hasError;
};

export const validateProductName = async (
  watch: UseFormWatch<ProductFormData>,
  selectedCategory: Category | undefined,
  setError: UseFormSetError<ProductFormData>,
  clearErrors: UseFormClearErrors<ProductFormData>
): Promise<boolean> => {
  const attributes = watch("attributes");

  if (!attributes || attributes.length === 0) {
    setError("attributes", {
      type: "manual",
      message: "Attributes must include at least model and brand.",
    });
    return false;
  }

  const model = attributes.find((attr) => attr.key === "model")?.value;
  const productName = watch("name");

  if (
    (model === "Other" && selectedCategory !== "Merchandising") ||
    selectedCategory === "Merchandising"
  ) {
    if (!productName || productName.trim() === "") {
      setError("name", {
        type: "manual",
        message: "Product Name is required.",
      });
      return false;
    }
  } else {
    clearErrors("name");
  }

  return true;
};

export const validateForNext = (
  attributes: Atrribute[],
  selectedCategory: Category | undefined,
  watch: (field: string) => any,
  methods: UseFormReturn<ProductFormData>,
  setCustomErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
): boolean => {
  let hasError = false;
  const attributeErrors: Record<string, string> = {};

  if (selectedCategory !== "Merchandising") {
    const brand = attributes.find((attr) => attr.key === "brand")?.value;
    const model = attributes.find((attr) => attr.key === "model")?.value;

    if (!brand) {
      attributeErrors["brand"] = "Brand is required.";
      hasError = true;
      methods.setError("attributes", {
        type: "manual",
        message: "Brand is required.",
      });
    }
    if (!model) {
      attributeErrors["model"] = "Model is required.";
      hasError = true;
      methods.setError("attributes", {
        type: "manual",
        message: "Model is required.",
      });
    }

    if (model === "Other" && !watch("name")) {
      attributeErrors["name"] = "Name is required.";
      hasError = true;
      methods.setError("name", {
        type: "manual",
        message: "Name is required.",
      });
    }
  }

  setCustomErrors(attributeErrors);
  return !hasError;
};

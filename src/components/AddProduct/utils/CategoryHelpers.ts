import { Category, emptyProduct, ProductFormData } from "@/types";
import { UseFormReturn } from "react-hook-form";

interface HandleCategoryChangeParams {
  category: Category | undefined;
  isUpdate: boolean;
  methods: UseFormReturn<ProductFormData>;
  setSelectedCategory: (category: Category | undefined) => void;
  setValue: (name: string, value: any) => void;
  setFormValues: React.Dispatch<React.SetStateAction<any>>;
  userRecoverableConfig?: Map<Category, boolean>;
  setManualChange: (value: boolean) => void;
}

export const handleCategoryChange = ({
  category,
  isUpdate,
  methods,
  setSelectedCategory,
  setValue,
  setFormValues,
  userRecoverableConfig,
  setManualChange,
}: HandleCategoryChangeParams) => {
  if (!isUpdate) {
    methods.reset({
      ...emptyProduct,
      category: category,
      assignedMember: "",
      assignedEmail: "",
      location: "",
    });
    setSelectedCategory(category);
    setValue("category", category || undefined);
    setManualChange(false);

    const isRecoverable =
      userRecoverableConfig?.get(category as Category) ??
      category !== "Merchandising";

    setValue("recoverable", isRecoverable);
    setFormValues((prev: any) => ({ ...prev, recoverable: isRecoverable }));
  }
};

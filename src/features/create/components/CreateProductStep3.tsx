"use client";
import { useState, useEffect } from "react";
import { Button } from "@/shared";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  zodCreateProductModel,
  DropdownInputProductForm,
  InputProductForm,
  QuantityCounter,
} from "@/features/assets";
import { CURRENCY_CODES } from "@/features/assets/interfaces/product";
import * as Switch from "@radix-ui/react-switch";

import computerData from "@/features/assets/components/JSON/computerform.json";
import audioData from "@/features/assets/components/JSON/audioform.json";
import monitorData from "@/features/assets/components/JSON/monitorform.json";
import peripheralsData from "@/features/assets/components/JSON/peripheralsform.json";
import othersData from "@/features/assets/components/JSON/othersform.json";
import merchandisingData from "@/features/assets/components/JSON/merchandisingform.json";

const categoryComponents = {
  Computers: computerData,
  Audio: audioData,
  Merchandising: merchandisingData,
  Monitors: monitorData,
  Peripherals: peripheralsData,
  Other: othersData,
};

interface CreateProductStep3Props {
  formData: any;
  onFormDataChange: (field: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCreateProduct: () => void;
}

export const CreateProductStep3 = ({
  formData,
  onFormDataChange,
  onNext,
  onPrevious,
  onCreateProduct,
}: CreateProductStep3Props) => {
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [selectedCategory] = useState(formData.category?.name);
  const [quantity, setQuantity] = useState(formData.quantity || 1);
  const [attributes, setAttributes] = useState<any[]>([]);

  // Lógica para deshabilitar campos cuando hay más de 2 productos
  const isMoreThanTwoProducts = quantity >= 2;
  const shouldGoToStep4 = quantity >= 2;

  // Reset hasAttemptedSubmit cuando se monta el componente
  useEffect(() => {
    setHasAttemptedSubmit(false);
  }, []);

  const methods = useForm({
    resolver: zodResolver(zodCreateProductModel),
    defaultValues: {
      name: formData.name || "",
      serialNumber: formData.serialNumber || "",
      productCondition: formData.productCondition || undefined,
      recoverable: formData.recoverable || false,
      acquisitionDate: formData.acquisitionDate || "",
      price: formData.price || { amount: 0, currencyCode: "USD" },
      additionalInfo: formData.additionalInfo || "",
      attributes: [],
      category: formData.category,
    },
  });

  const {
    handleSubmit,
    setValue,
    clearErrors,
    trigger,
    watch,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (isMoreThanTwoProducts && formData.productCondition !== "Optimal") {
      onFormDataChange("productCondition", "Optimal");
      setValue("productCondition" as any, "Optimal");
    }
  }, [
    isMoreThanTwoProducts,
    formData.productCondition,
    onFormDataChange,
    setValue,
  ]);

  const FormConfig = categoryComponents[selectedCategory] || { fields: [] };

  const handleAttributesChange = (newAttributes: any[]) => {
    setAttributes(newAttributes);
    onFormDataChange("attributes", newAttributes);
    setValue("attributes" as any, newAttributes);
  };

  const handleAttributeChange = (fieldName: string, value: string) => {
    const updatedAttributes = attributes
      .map((attr) => (attr?.key === fieldName ? { ...attr, value } : attr))
      .filter(Boolean);

    // Si no existe el atributo, lo agregamos
    if (!updatedAttributes.find((attr) => attr.key === fieldName)) {
      updatedAttributes.push({ key: fieldName, value });
    }

    setAttributes(updatedAttributes);
    handleAttributesChange(updatedAttributes);

    // Limpiar errores solo si ya se intentó hacer submit
    if (hasAttemptedSubmit) {
      setCustomErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const validateAttributes = (attributes: any[], category: string) => {
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

  const validateProductName = async () => {
    const model = attributes?.find((attr) => attr.key === "model")?.value;
    const productName = watch("name") as string;

    if (
      selectedCategory === "Merchandising" &&
      (!productName || productName.trim() === "")
    ) {
      methods.setError("name", {
        type: "manual",
        message: "Product Name is required for Merchandising.",
      });
      return false;
    }

    if (model === "Other" && (!productName || productName.trim() === "")) {
      methods.setError("name", {
        type: "manual",
        message: "Product Name is required when model is Other.",
      });
      return false;
    } else {
      clearErrors("name");
    }

    return true;
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    onFormDataChange("quantity", newQuantity);
  };

  const handleNext = async () => {
    setHasAttemptedSubmit(true);

    const isProductNameValid = await validateProductName();
    if (!isProductNameValid) return;

    const isAttributesValid = validateAttributes(attributes, selectedCategory);
    if (!isAttributesValid) return;

    // Si hay más de 2 productos, ir al paso 4, sino crear directamente
    if (shouldGoToStep4) {
      onNext();
    } else {
      onCreateProduct();
    }
  };

  const getAttributeValue = (fieldName: string) => {
    return attributes.find((attr) => attr.key === fieldName)?.value || "";
  };

  const getAttributeError = (fieldName: string) => {
    if (!hasAttemptedSubmit) return null;
    return customErrors[fieldName] || null;
  };

  const renderCategoryField = (field: any) => {
    const value = getAttributeValue(field.name);
    const error = getAttributeError(field.name);
    const isRequired =
      selectedCategory !== "Merchandising" &&
      ["brand", "model"].includes(field.name);

    return (
      <div key={field.name}>
        <DropdownInputProductForm
          title={field.title}
          placeholder={field.title}
          options={field.options}
          selectedOption={value}
          onChange={(newValue) => handleAttributeChange(field.name, newValue)}
          name={field.name}
          searchable={true}
          required={isRequired ? "required" : undefined}
        />
        <div className="min-h-[24px]">
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
      </div>
    );
  };

  return (
    <FormProvider {...methods}>
      <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
        <div className="mb-6">
          <h2 className="mb-2 font-semibold text-gray-900 text-xl">
            Step 3: Product Details
          </h2>
          <p className="text-gray-600">
            Complete the product details for {selectedCategory} category
          </p>
        </div>

        <div className="space-y-6">
          {/* Quantity Counter */}
          <div className="flex items-center space-x-4">
            <QuantityCounter
              quantity={quantity}
              setQuantity={handleQuantityChange}
            />
            {isMoreThanTwoProducts && (
              <div className="bg-orange-50 px-3 py-2 rounded-md text-orange-600 text-sm">
                <p>
                  Serial Number and Additional Info will be configured per
                  product in the next step
                </p>
              </div>
            )}
          </div>

          {/* Basic Product Information */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <InputProductForm
                title="Product Name"
                placeholder="Product Name"
                value={formData.name || ""}
                onChange={(e) => {
                  onFormDataChange("name", e.target.value);
                  setValue("name" as any, e.target.value);
                }}
                name="name"
              />
              {errors.name && (
                <p className="mt-1 text-red-500 text-xs">
                  {String(errors.name.message)}
                </p>
              )}
            </div>

            <div>
              <InputProductForm
                title="Serial Number"
                placeholder={
                  isMoreThanTwoProducts
                    ? "Will be configured per product"
                    : "Serial Number"
                }
                value={formData.serialNumber || ""}
                onChange={(e) => {
                  onFormDataChange("serialNumber", e.target.value);
                  setValue("serialNumber" as any, e.target.value);
                }}
                name="serialNumber"
                disabled={isMoreThanTwoProducts}
              />
            </div>

            <div>
              <DropdownInputProductForm
                title="Product Condition"
                placeholder={
                  isMoreThanTwoProducts
                    ? "Will be set to Optimal for all products"
                    : "Selecciona una condición"
                }
                options={["Optimal", "Detective", "Unusable"]}
                selectedOption={formData.productCondition || undefined}
                onChange={(value) => {
                  if (!isMoreThanTwoProducts) {
                    onFormDataChange("productCondition", value);
                    setValue("productCondition" as any, value);
                  }
                }}
                name="productCondition"
                searchable={false}
                disabled={isMoreThanTwoProducts}
              />
            </div>

            <div>
              <InputProductForm
                title="Acquisition Date"
                placeholder="dd/mm/aaaa"
                type="date"
                value={formData.acquisitionDate || ""}
                onChange={(e) => {
                  onFormDataChange("acquisitionDate", e.target.value);
                  setValue("acquisitionDate" as any, e.target.value);
                }}
                name="acquisitionDate"
              />
            </div>

            <div>
              <InputProductForm
                title="Price Amount"
                placeholder="Price Amount"
                type="text"
                value={formData.price?.amount?.toString() || "0"}
                onChange={(e) => {
                  const newPrice = {
                    ...formData.price,
                    amount: parseFloat(e.target.value) || 0,
                  };
                  onFormDataChange("price", newPrice);
                  setValue("price" as any, newPrice);
                }}
                name="priceAmount"
                min={0}
              />
            </div>

            <div>
              <DropdownInputProductForm
                title="Currency"
                placeholder="Currency"
                options={CURRENCY_CODES}
                selectedOption={formData.price?.currencyCode || "USD"}
                onChange={(value) => {
                  const newPrice = {
                    ...formData.price,
                    currencyCode: value,
                  };
                  onFormDataChange("price", newPrice);
                  setValue("price" as any, newPrice);
                }}
                name="currency"
                searchable={true}
              />
            </div>
          </div>

          {/* Recoverable Switch */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="recoverable" className="font-sans text-dark-grey">
              Recoverable
            </label>
            <Switch.Root
              id="recoverable"
              checked={formData.recoverable || false}
              onCheckedChange={(checked) => {
                onFormDataChange("recoverable", checked);
                setValue("recoverable" as any, checked);
              }}
              className={`${
                formData.recoverable ? "bg-blue/80" : "bg-gray-300"
              } relative inline-flex h-8 w-14 items-center rounded-full`}
            >
              <Switch.Thumb
                className={`${
                  formData.recoverable ? "translate-x-6" : "translate-x-1"
                } inline-block h-6 w-6 transform bg-white rounded-full transition`}
              />
            </Switch.Root>
          </div>

          {/* Dynamic Form based on Category */}
          {FormConfig.fields && FormConfig.fields.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-medium text-gray-900 text-lg">
                Product Specifications
              </h3>
              <div className="gap-4 grid grid-cols-1 lg:grid-cols-3">
                {FormConfig.fields.map((field) => renderCategoryField(field))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div>
            <InputProductForm
              title="Additional Info"
              placeholder={
                isMoreThanTwoProducts
                  ? "Will be configured per product"
                  : "Enter additional information"
              }
              type="textarea"
              value={formData.additionalInfo || ""}
              onChange={(e) => {
                onFormDataChange("additionalInfo", e.target.value);
                setValue("additionalInfo" as any, e.target.value);
              }}
              name="additionalInfo"
              disabled={isMoreThanTwoProducts}
            />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button onClick={onPrevious} variant="outline" className="py-2">
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 text-white"
          >
            <span>{shouldGoToStep4 ? "Next" : "Create Product"}</span>
          </Button>
        </div>
      </div>
    </FormProvider>
  );
};

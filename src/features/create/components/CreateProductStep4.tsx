"use client";
import { useState, useEffect } from "react";
import { Button } from "@/shared";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  zodCreateProductModel,
  InputProductForm,
  ProductDetail,
} from "@/features/assets";
import type { Product } from "@/features/assets";

interface CreateProductStep4Props {
  formData: any;
  onFormDataChange: (field: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCreateProduct: () => void;
}

// Componente para mostrar un solo ProductDetail y múltiples inputs de Serial Number
const ProductSerialNumbers = ({
  baseProduct,
  products,
  onSerialNumberChange,
  errors,
  categoryName,
}: {
  baseProduct: any;
  products: any[];
  onSerialNumberChange: (index: number, value: string) => void;
  errors: Record<string, string>;
  categoryName: string;
}) => {
  // Crear un objeto Product compatible con ProductDetail (usando el primer producto como base)
  const productForDetail: Product = {
    _id: `temp_base`,
    name: baseProduct.name || "",
    serialNumber: "", // No mostrar serial number en el ProductDetail
    category: (categoryName === "Computers"
      ? "Computer"
      : categoryName === "Monitors"
      ? "Monitor"
      : categoryName) as any,
    attributes: Array.isArray(baseProduct.attributes)
      ? baseProduct.attributes.filter(
          (attr) =>
            attr && typeof attr === "object" && "key" in attr && "value" in attr
        )
      : [],
    productCondition: baseProduct.productCondition || "",
    recoverable: baseProduct.recoverable || false,
    acquisitionDate: baseProduct.acquisitionDate || "",
    price: baseProduct.price || { amount: 0, currencyCode: "USD" },
    additionalInfo: baseProduct.additionalInfo || "",
    assignedEmail: "",
    assignedMember: "",
    location: "",
    status: "Available",
    activeShipment: false,
    origin: "",
    lastAssigned: "",
    shipmentOrigin: "",
    shipmentDestination: "",
    shipmentId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      {/* Un solo ProductDetail Card */}
      <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
        <h3 className="mb-3 font-semibold text-gray-800 text-lg">
          Product Details (Same for all {products.length} products)
        </h3>
        <ProductDetail
          product={productForDetail}
          className="bg-transparent p-0 border-0"
          disabled={true}
        />
      </div>

      {/* Múltiples inputs de Serial Number */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 text-lg">
          Serial Numbers for Each Product
        </h3>
        {products.map((product, index) => (
          <div
            key={product.id}
            className="bg-white p-4 border border-gray-200 rounded-lg"
          >
            <h4 className="mb-3 font-medium text-gray-700">
              Serial Number for Product {index + 1}
            </h4>
            <div>
              <InputProductForm
                title=""
                placeholder="Enter serial number"
                value={product.serialNumber || ""}
                onChange={(e) => onSerialNumberChange(index, e.target.value)}
                name={`serialNumber_${index}`}
              />
              {errors[`serialNumber_${index}`] && (
                <p className="mt-1 text-red-500 text-xs">
                  {errors[`serialNumber_${index}`]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CreateProductStep4 = ({
  formData,
  onFormDataChange,
  onNext,
  onPrevious,
  onCreateProduct,
}: CreateProductStep4Props) => {
  const [products, setProducts] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize products array based on quantity
    const initialProducts = Array.from(
      { length: formData.quantity },
      (_, index) => {
        const existingProduct = formData.products?.[index];
        return {
          id: index + 1,
          serialNumber: existingProduct?.serialNumber || "",
          name: existingProduct?.name || formData.name || "",
          attributes: existingProduct?.attributes || formData.attributes || [],
          productCondition:
            existingProduct?.productCondition ||
            formData.productCondition ||
            "",
          recoverable:
            existingProduct?.recoverable !== undefined
              ? existingProduct.recoverable
              : formData.recoverable || false,
          acquisitionDate:
            existingProduct?.acquisitionDate || formData.acquisitionDate || "",
          price: existingProduct?.price ||
            formData.price || { amount: 0, currencyCode: "USD" },
          additionalInfo:
            existingProduct?.additionalInfo || formData.additionalInfo || "",
        };
      }
    );
    setProducts(initialProducts);
  }, [formData.quantity, formData]);

  const handleSerialNumberChange = (index: number, value: string) => {
    const updatedProducts = products.map((product, i) =>
      i === index ? { ...product, serialNumber: value } : product
    );
    setProducts(updatedProducts);
    onFormDataChange("products", updatedProducts);

    // Clear error when user starts typing
    if (errors[`serialNumber_${index}`]) {
      setErrors((prev) => ({
        ...prev,
        [`serialNumber_${index}`]: undefined,
      }));
    }
  };

  // Obtener el producto base (primer producto) para mostrar en ProductDetail
  const baseProduct = products[0] || {
    name: formData.name || "",
    attributes: formData.attributes || [],
    productCondition: formData.productCondition || "",
    recoverable: formData.recoverable || false,
    acquisitionDate: formData.acquisitionDate || "",
    price: formData.price || { amount: 0, currencyCode: "USD" },
    additionalInfo: formData.additionalInfo || "",
  };

  const handleNext = () => {
    onCreateProduct();
  };

  return (
    <FormProvider {...useForm()}>
      <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
        <div className="mb-6">
          <h2 className="mb-2 font-semibold text-gray-900 text-xl">
            Step 4: Individual Product Serial Numbers
          </h2>
          <p className="text-gray-600">
            Configure the serial number for each of the {formData.quantity}{" "}
            products. All other details are inherited from Step 3.
          </p>
        </div>

        <ProductSerialNumbers
          baseProduct={baseProduct}
          products={products}
          onSerialNumberChange={handleSerialNumberChange}
          errors={errors}
          categoryName={formData.category?.name || "Other"}
        />

        <div className="flex justify-between mt-8">
          <Button onClick={onPrevious} variant="outline" className="py-2">
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 text-white"
          >
            <span>Create Products</span>
          </Button>
        </div>
      </div>
    </FormProvider>
  );
};

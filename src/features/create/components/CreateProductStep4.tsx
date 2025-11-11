"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/shared";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  zodCreateProductModel,
  InputProductForm,
  ProductDetail,
  DropdownInputProductForm,
} from "@/features/assets";
import type { Product } from "@/features/assets";
import { useWarehousesForCreate } from "../hooks/useWarehousesForCreate";

interface CreateProductStep4Props {
  formData: any;
  onFormDataChange: (field: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCreateProduct: () => void;
}

const ProductSerialNumbers = ({
  baseProduct,
  products,
  onSerialNumberChange,
  onAdditionalInfoChange,
  onWarehouseChange,
  errors,
  categoryName,
  warehouses,
  isLoadingWarehouses,
}: {
  baseProduct: any;
  products: any[];
  onSerialNumberChange: (index: number, value: string) => void;
  onAdditionalInfoChange: (index: number, value: string) => void;
  onWarehouseChange: (index: number, warehouseLabel: string) => void;
  errors: Record<string, string>;
  categoryName: string;
  warehouses: any[];
  isLoadingWarehouses: boolean;
}) => {
  // Ordenar warehouses alfabéticamente por nombre
  const sortedWarehouses = useMemo(() => {
    return warehouses
      ? [...warehouses].sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [warehouses]);

  const productForDetail: Product = {
    _id: `temp_base`,
    name: baseProduct.name || "",
    serialNumber: "",
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

      {/* Múltiples inputs de Serial Number y Additional Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 text-lg">
          Individual Product Details
        </h3>
        {products.map((product, index) => (
          <div
            key={product.id}
            className="bg-white p-4 border border-gray-200 rounded-lg"
          >
            <h4 className="mb-3 font-medium text-gray-700">
              Product {index + 1}
            </h4>
            <div className="space-y-4">
              <div>
                <DropdownInputProductForm
                  title="FP Warehouse"
                  placeholder={
                    isLoadingWarehouses
                      ? "Loading warehouses..."
                      : "Select a warehouse"
                  }
                  options={
                    !isLoadingWarehouses
                      ? sortedWarehouses.map((w) => `${w.name} (${w.country})`)
                      : []
                  }
                  selectedOption={
                    product.warehouse
                      ? `${product.warehouse.name} (${product.warehouse.country})`
                      : ""
                  }
                  onChange={(warehouseLabel) =>
                    onWarehouseChange(index, warehouseLabel)
                  }
                  name={`warehouse_${index}`}
                  searchable={true}
                  disabled={isLoadingWarehouses}
                  required="required"
                />
                {errors[`warehouse_${index}`] && (
                  <p className="mt-1 text-red-500 text-xs">
                    {errors[`warehouse_${index}`]}
                  </p>
                )}
              </div>
              <div>
                <InputProductForm
                  title="Serial Number"
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
              <div>
                <InputProductForm
                  title="Additional Info"
                  placeholder="Enter additional information"
                  type="textarea"
                  value={product.additionalInfo || ""}
                  onChange={(e) =>
                    onAdditionalInfoChange(index, e.target.value)
                  }
                  name={`additionalInfo_${index}`}
                />
                {errors[`additionalInfo_${index}`] && (
                  <p className="mt-1 text-red-500 text-xs">
                    {errors[`additionalInfo_${index}`]}
                  </p>
                )}
              </div>
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

  // Cargar warehouses dinámicamente desde la API
  const { warehouses, isLoading: isLoadingWarehouses } =
    useWarehousesForCreate();

  useEffect(() => {
    // Initialize products array based on quantity
    const initialProducts = Array.from(
      { length: formData.quantity },
      (_, index) => {
        const existingProduct = formData.products?.[index];
        return {
          id: index + 1,
          serialNumber: existingProduct?.serialNumber || "",
          warehouse: existingProduct?.warehouse || null,
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

  const handleAdditionalInfoChange = (index: number, value: string) => {
    const updatedProducts = products.map((product, i) =>
      i === index ? { ...product, additionalInfo: value } : product
    );
    setProducts(updatedProducts);
    onFormDataChange("products", updatedProducts);

    // Clear error when user starts typing
    if (errors[`additionalInfo_${index}`]) {
      setErrors((prev) => ({
        ...prev,
        [`additionalInfo_${index}`]: undefined,
      }));
    }
  };

  const handleWarehouseChange = (index: number, warehouseLabel: string) => {
    const selectedWarehouse = warehouses.find(
      (w) => `${w.name} (${w.country})` === warehouseLabel
    );
    const updatedProducts = products.map((product, i) =>
      i === index
        ? { ...product, warehouse: selectedWarehouse || null }
        : product
    );
    setProducts(updatedProducts);
    onFormDataChange("products", updatedProducts);

    // Clear error when user selects a warehouse
    if (errors[`warehouse_${index}`]) {
      setErrors((prev) => ({
        ...prev,
        [`warehouse_${index}`]: undefined,
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
    // Validar que todos los productos tengan warehouse
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    products.forEach((product, index) => {
      if (!product.warehouse) {
        newErrors[`warehouse_${index}`] = "Warehouse is required";
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    onCreateProduct();
  };

  return (
    <FormProvider {...useForm()}>
      <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
        <div className="mb-6">
          <h2 className="mb-2 font-semibold text-gray-900 text-xl">
            Step 4: Individual Product Details
          </h2>
          <p className="text-gray-600">
            Configure the serial number and additional info for each of the{" "}
            {formData.quantity} products. All other details are inherited from
            Step 3.
          </p>
        </div>

        <ProductSerialNumbers
          baseProduct={baseProduct}
          products={products}
          onSerialNumberChange={handleSerialNumberChange}
          onAdditionalInfoChange={handleAdditionalInfoChange}
          onWarehouseChange={handleWarehouseChange}
          errors={errors}
          categoryName={formData.category?.name || "Other"}
          warehouses={warehouses}
          isLoadingWarehouses={isLoadingWarehouses}
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

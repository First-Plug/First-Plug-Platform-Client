"use client";
import { useState } from "react";
import {
  CreateProductStep1,
  CreateProductStep2,
  CreateProductStep3,
  CreateProductStep4,
  CreateProductConfirmation,
  useBulkCreateProducts,
} from "@/features/create";
import { useAlertStore } from "@/shared/stores/alerts.store";

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { setAlert } = useAlertStore();
  const bulkCreateMutation = useBulkCreateProducts();

  const [formData, setFormData] = useState({
    tenant: null,
    category: null,
    warehouse: null,
    name: "",
    quantity: 1,
    pricePerUnit: 0,
    acquisitionDate: null,
    productCondition: null,
    model: null,
    processor: null,
    recoverable: false,
    currency: "USD",
    serialNumber: null,
    brand: null,
    color: null,
    ram: null,
    storage: null,
    screen: null,
    keyboardLanguage: null,
    gpu: null,
    additionalInfo: null,
    attributes: [],
    price: { amount: null, currencyCode: "USD" },
    products: [],
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      // Si estamos en el Step 3 y vamos al Step 2, limpiar los datos del Step 3
      if (currentStep === 3) {
        setFormData((prev) => ({
          ...prev,
          // Limpiar datos específicos del Step 3
          name: "",
          serialNumber: "",
          productCondition: null,
          recoverable: false,
          acquisitionDate: "",
          price: { amount: null, currencyCode: "USD" },
          additionalInfo: "",
          attributes: [],
          quantity: 1,
          warehouse: null,
        }));
      }
      // Si estamos en el Step 4 y vamos al Step 3, limpiar los datos del Step 4
      if (currentStep === 4) {
        setFormData((prev) => ({
          ...prev,
          products: [],
        }));
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormDataChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateProduct = () => {
    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    try {
      // Mapear categoría frontend a backend
      const categoryMap: Record<string, string> = {
        Computers: "Computer",
        Monitors: "Monitor",
        Peripherals: "Peripherals",
        Audio: "Audio",
        Merchandising: "Merchandising",
        Other: "Other",
      };

      // Construir el array de productos según la cantidad
      let productsArray;
      if (formData.quantity >= 2) {
        // Múltiples productos desde Step 4
        productsArray = (formData.products || []).map((product: any) => ({
          serialNumber: product.serialNumber || "",
          warehouseCountryCode:
            product.warehouse?.countryCode || product.warehouse?.country || "",
          additionalInfo: product.additionalInfo || undefined,
        }));
      } else {
        // Un solo producto desde Step 3
        productsArray = [
          {
            serialNumber: formData.serialNumber || "",
            warehouseCountryCode:
              formData.warehouse?.countryCode ||
              formData.warehouse?.country ||
              "",
            additionalInfo: formData.additionalInfo || undefined,
          },
        ];
      }

      // Construir el payload para la API
      const payload: any = {
        tenantName: formData.tenant?.tenantName || "",
        name: formData.name || "",
        category: categoryMap[formData.category?.name] || "Other",
        attributes: formData.attributes || [],
        productCondition: formData.productCondition || "Optimal",
        recoverable: formData.recoverable || false,
        acquisitionDate: formData.acquisitionDate || "",
        quantity: formData.quantity || 1,
        products: productsArray,
      };

      // Solo agregar price si tiene un valor válido
      if (formData.price?.amount && formData.price.amount > 0) {
        payload.price = {
          amount: formData.price.amount,
          currencyCode: formData.price?.currencyCode || "USD",
        };
      }

      // Llamar al endpoint
      await bulkCreateMutation.mutateAsync(payload);

      // Mostrar alerta de éxito
      setAlert("createProduct");

      setShowConfirmation(false);

      // Reiniciar todo el formulario y volver al Step 1
      setCurrentStep(1);
      setFormData({
        tenant: null,
        category: null,
        warehouse: null,
        name: "",
        quantity: 1,
        pricePerUnit: 0,
        acquisitionDate: null,
        productCondition: null,
        model: null,
        processor: null,
        recoverable: false,
        currency: "USD",
        serialNumber: null,
        brand: null,
        color: null,
        ram: null,
        storage: null,
        screen: null,
        keyboardLanguage: null,
        gpu: null,
        additionalInfo: null,
        attributes: [],
        price: { amount: null, currencyCode: "USD" },
        products: [],
      });
    } catch (error: any) {
      console.error("Error creating products:", error);
      setAlert("dynamicWarning", {
        message:
          error?.response?.data?.message ||
          "Failed to create products. Please try again.",
      });
    }
  };

  const handleCancelCreate = () => {
    setShowConfirmation(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CreateProductStep1
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 2:
        return (
          <CreateProductStep2
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <CreateProductStep3
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onCreateProduct={handleCreateProduct}
          />
        );
      case 4:
        return (
          <CreateProductStep4
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onCreateProduct={handleCreateProduct}
          />
        );
    }
  };

  return (
    <div className="p-6">
      {/* Step Indicator */}
      <div className="flex justify-center items-center mb-8">
        <div className="flex items-center space-x-4">
          {(() => {
            // Mostrar solo 3 pasos si hay menos de 2 productos, sino 4 pasos
            const totalSteps = formData.quantity >= 2 ? 4 : 3;
            const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

            return steps.map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < totalSteps && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      step < currentStep ? "bg-blue" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ));
          })()}
        </div>
      </div>

      {renderStep()}

      {showConfirmation && (
        <CreateProductConfirmation
          formData={formData}
          onConfirm={handleConfirmCreate}
          onCancel={handleCancelCreate}
        />
      )}
    </div>
  );
}

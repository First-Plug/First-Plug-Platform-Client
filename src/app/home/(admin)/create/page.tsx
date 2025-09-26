"use client";
import { useState } from "react";
import {
  CreateProductStep1,
  CreateProductStep2,
  CreateProductStep3,
  CreateProductStep4,
  CreateProductConfirmation,
} from "@/features/create";

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    tenant: null,
    category: null,
    warehouse: null,
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
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
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

  const handleConfirmCreate = () => {
    // Aquí se implementaría la lógica para crear el producto
    console.log("Creando producto con datos:", formData);
    // Por ahora solo mostramos un alert
    alert("Product created successfully!");
    setShowConfirmation(false);
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

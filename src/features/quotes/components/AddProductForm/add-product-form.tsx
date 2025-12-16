"use client";

import * as React from "react";
import { Button } from "@/shared";
import { useQuoteStore } from "../../store/quote.store";
import { StepCategorySelection } from "../AddProductModal/step-category-selection";
import { StepOSSelection } from "../AddProductModal/step-os-selection";
import { StepTechnicalSpecs } from "../AddProductModal/step-technical-specs";
import { StepQuoteDetails } from "../AddProductModal/step-quote-details";
import type { QuoteProduct } from "../../types/quote.types";
import { useToast } from "@/shared/components/ui/use-toast";

interface AddProductFormProps {
  onCancel: () => void;
  onComplete: () => void;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({
  onCancel,
  onComplete,
}) => {
  const {
    addProduct,
    setIsAddingProduct,
    setCurrentStep,
    currentStep,
    setOnBack,
    setOnCancel,
  } = useQuoteStore();
  const { toast } = useToast();

  // Usar ref para mantener referencia estable a onCancel
  const onCancelRef = React.useRef(onCancel);
  React.useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  // Inicializar estado cuando se monta el componente y crear funciones estables
  React.useEffect(() => {
    setIsAddingProduct(true);
    setCurrentStep(1);

    // Crear funciones que leen el estado actual del store
    const handleBack = () => {
      const currentStepValue = useQuoteStore.getState().currentStep;
      if (currentStepValue > 1) {
        setCurrentStep(currentStepValue - 1);
      }
    };

    const handleCancel = () => {
      setIsAddingProduct(false);
      onCancelRef.current();
    };

    setOnBack(handleBack);
    setOnCancel(handleCancel);

    return () => {
      setIsAddingProduct(false);
      setCurrentStep(1);
      setOnBack(undefined);
      setOnCancel(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  // Funciones locales para usar en el componente (botones del footer)
  const handleBack = React.useCallback(() => {
    const currentStepValue = useQuoteStore.getState().currentStep;
    if (currentStepValue > 1) {
      setCurrentStep(currentStepValue - 1);
    }
  }, [setCurrentStep]);

  const handleCancel = React.useCallback(() => {
    setIsAddingProduct(false);
    onCancelRef.current();
  }, [setIsAddingProduct]);

  const generateId = () => {
    return `quote-product-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  };

  const [productData, setProductData] = React.useState<Partial<QuoteProduct>>({
    id: generateId(),
    quantity: 1,
    brands: [],
    models: [],
    processors: [],
  });

  const handleDataChange = (updates: Partial<QuoteProduct>) => {
    setProductData((prev) => ({ ...prev, ...updates }));
  };

  const handleCategorySelect = (category: string) => {
    handleDataChange({ category });
    const nextStep = 2;
    setCurrentStep(nextStep);
  };

  const handleOSSelect = (os: string) => {
    handleDataChange({ operatingSystem: os });
    // Avanzar automáticamente al siguiente paso
    const nextStep = 3;
    setCurrentStep(nextStep);
  };

  const handleOSSkip = () => {
    handleDataChange({ operatingSystem: undefined });
    // Avanzar automáticamente al siguiente paso
    const nextStep = 3;
    setCurrentStep(nextStep);
  };

  const handleNext = () => {
    // Validaciones antes de avanzar
    if (currentStep === 3) {
      // Solo validar quantity en step 3
      if (!productData.quantity || productData.quantity < 1) return;
      const nextStep = 4;
      setCurrentStep(nextStep);
    } else if (currentStep === 4) {
      // Validar campos requeridos del step 4
      if (!productData.country) return;
      // Guardar producto
      const completeProduct: QuoteProduct = {
        id: productData.id!,
        category: productData.category!,
        operatingSystem: productData.operatingSystem,
        quantity: productData.quantity!,
        brands: productData.brands || [],
        models: productData.models || [],
        processors: productData.processors,
        ram: productData.ram,
        storage: productData.storage,
        screenSize: productData.screenSize,
        extendedWarranty: productData.extendedWarranty,
        deviceEnrollment: productData.deviceEnrollment,
        otherSpecifications: productData.otherSpecifications,
        country: productData.country!,
        city: productData.city,
        requiredDeliveryDate: productData.requiredDeliveryDate,
        additionalComments: productData.additionalComments,
      };
      addProduct(completeProduct);
      toast({
        title: "Product Added",
        description: "Product added to your quote request.",
      });
      onComplete();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Select Product Category";
      case 2:
        return "Select Operating System";
      case 3:
        return "Technical Specifications";
      case 4:
        return "Quote Details";
      default:
        return "";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepCategorySelection
            selectedCategory={productData.category || null}
            onCategorySelect={handleCategorySelect}
          />
        );
      case 2:
        return (
          <StepOSSelection
            selectedOS={productData.operatingSystem || null}
            onOSSelect={handleOSSelect}
            onSkip={handleOSSkip}
          />
        );
      case 3:
        return (
          <StepTechnicalSpecs
            category={productData.category || ""}
            productData={productData}
            onDataChange={handleDataChange}
          />
        );
      case 4:
        return (
          <StepQuoteDetails
            productData={productData}
            onDataChange={handleDataChange}
          />
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 3) {
      // Solo validar quantity en step 3
      return !!productData.quantity && productData.quantity >= 1;
    } else if (currentStep === 4) {
      return !!productData.country;
    }
    return true;
  };

  return (
    <div className="flex justify-center w-full">
      <div className="bg-white p-6 w-full max-w-4xl">
        {/* Content */}
        <div className="py-6">{renderStep()}</div>

        {/* Footer - Solo mostrar en steps 3 y 4 */}
        {(currentStep === 3 || currentStep === 4) && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              variant="primary"
              body={currentStep === 4 ? "Save Product" : "Continue"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

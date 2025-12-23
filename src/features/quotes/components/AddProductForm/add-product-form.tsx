"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/shared";
import { useQuoteStore } from "../../store/quote.store";
import { StepCategorySelection } from "../AddProductModal/step-category-selection";
import { StepOSSelection } from "../AddProductModal/step-os-selection";
import { StepTechnicalSpecs } from "../AddProductModal/step-technical-specs";
import { StepQuoteDetails } from "../AddProductModal/step-quote-details";
import type { QuoteProduct } from "../../types/quote.types";

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
    updateProduct,
    getProduct,
    setIsAddingProduct,
    setCurrentStep,
    currentStep,
    editingProductId,
    setEditingProductId,
    setOnBack,
    setOnCancel,
  } = useQuoteStore();

  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    setIsAddingProduct(true);

    // Si hay un producto en edición, empezar en step 2 y cargar datos
    if (editingProductId) {
      const editingProduct = getProduct(editingProductId);
      if (editingProduct) {
        setProductData(editingProduct);
        setCurrentStep(2); // Empezar en step 2 (OS selection)
      }
    } else {
      setCurrentStep(1);
    }

    const handleBack = () => {
      const currentStepValue = useQuoteStore.getState().currentStep;
      const editingId = useQuoteStore.getState().editingProductId;
      // Si estamos editando, no permitir volver al step 1 (mínimo step 2)
      const minStep = editingId ? 2 : 1;
      if (currentStepValue > minStep) {
        setCurrentStep(currentStepValue - 1);
      }
    };

    const handleCancel = () => {
      setIsAddingProduct(false);
      setEditingProductId(undefined);
      onCancelRef.current();
    };

    setOnBack(handleBack);
    setOnCancel(handleCancel);

    return () => {
      setIsAddingProduct(false);
      setCurrentStep(1);
      setEditingProductId(undefined);
      setOnBack(undefined);
      setOnCancel(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingProductId]);

  const handleBack = useCallback(() => {
    const currentStepValue = useQuoteStore.getState().currentStep;
    const editingId = useQuoteStore.getState().editingProductId;
    // Si estamos editando, no permitir volver al step 1 (mínimo step 2)
    const minStep = editingId ? 2 : 1;
    if (currentStepValue > minStep) {
      setCurrentStep(currentStepValue - 1);
    }
  }, [setCurrentStep]);

  const generateId = () => {
    return `quote-product-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  };

  const [productData, setProductData] = useState<Partial<QuoteProduct>>({
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

    const nextStep = 3;
    setCurrentStep(nextStep);
  };

  const handleOSSkip = () => {
    handleDataChange({ operatingSystem: undefined });

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

      // Si estamos editando, actualizar el producto existente
      if (editingProductId) {
        updateProduct(editingProductId, {
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
        });
        setEditingProductId(undefined);
      } else {
        // Si es nuevo producto, agregarlo
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
      }
      onComplete();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        // No mostrar step 1 si estamos editando
        if (editingProductId) {
          return null;
        }
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

        {/* Footer - Mostrar en steps 2, 3 y 4 (step 2 solo cuando se edita) */}
        {((currentStep === 2 && editingProductId) ||
          currentStep === 3 ||
          currentStep === 4) && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={
                currentStep === 2
                  ? () => {
                      // Si estamos en step 2 y editando, avanzar a step 3
                      if (editingProductId) {
                        setCurrentStep(3);
                      }
                    }
                  : handleNext
              }
              disabled={currentStep === 2 ? false : !canProceed()}
              variant="primary"
              size="small"
              body={currentStep === 4 ? "Save Product" : "Continue"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

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
    setCurrentCategory,
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

  useEffect(() => {
    setIsAddingProduct(true);

    // Si hay un producto en edición, cargar datos y determinar el step inicial
    if (editingProductId) {
      const editingProduct = getProduct(editingProductId);
      if (editingProduct) {
        setProductData(editingProduct);
        // Establecer la categoría en el store
        if (editingProduct.category) {
          setCurrentCategory(editingProduct.category);
        }
        // Si es Monitor, empezar en step 3 (technical specs)
        // Si es Computer u otra categoría, empezar en step 2 (OS selection)
        const initialStep =
          editingProduct.category?.toLowerCase() === "monitor" ? 3 : 2;
        setCurrentStep(initialStep);
      }
    } else {
      setCurrentStep(1);
      setCurrentCategory(undefined); // Limpiar categoría cuando no hay edición
    }

    const handleBack = () => {
      const currentStepValue = useQuoteStore.getState().currentStep;
      const editingId = useQuoteStore.getState().editingProductId;
      const editingProduct = editingId ? getProduct(editingId) : null;
      const currentCat = useQuoteStore.getState().currentCategory;
      const isMonitor =
        currentCat?.toLowerCase() === "monitor" ||
        editingProduct?.category?.toLowerCase() === "monitor";

      // Determinar el step mínimo según si es edición y la categoría
      const minStep = editingId ? (isMonitor ? 3 : 2) : 1;

      // Si estamos editando y estamos en el step mínimo, salir del modo de edición
      if (editingId && currentStepValue === minStep) {
        setIsAddingProduct(false);
        setEditingProductId(undefined);
        setCurrentCategory(undefined);
        setCurrentStep(1);
        onCancelRef.current();
        return;
      }

      if (currentStepValue > minStep) {
        // Resetear datos del step actual antes de retroceder
        if (currentStepValue === 4) {
          // Resetear datos del step 4 (quote details)
          setProductData((prev) => ({
            ...prev,
            country: undefined,
            city: undefined,
            requiredDeliveryDate: undefined,
            additionalComments: undefined,
          }));
        } else if (currentStepValue === 3) {
          // Si es Monitor y vamos al step 1, también limpiar la categoría
          if (isMonitor && !editingId) {
            // Resetear datos del step 3 y limpiar categoría, manteniendo el ID
            setProductData((prev) => ({
              id: prev.id || generateId(),
              quantity: 1,
              brands: [],
              models: [],
              processors: [],
              category: undefined,
            }));
            setCurrentCategory(undefined);
          } else {
            // Resetear solo datos del step 3 (technical specs)
            setProductData((prev) => ({
              ...prev,
              quantity: 1,
              brands: [],
              models: [],
              processors: undefined,
              ram: undefined,
              storage: undefined,
              screenSize: undefined,
              screenTechnology: undefined,
              extendedWarranty: undefined,
              deviceEnrollment: undefined,
              otherSpecifications: undefined,
            }));
          }
        } else if (currentStepValue === 2) {
          // Resetear datos del step 2 (OS selection)
          setProductData((prev) => ({
            ...prev,
            operatingSystem: undefined,
          }));
        }

        // Navegación especial para Monitor: 4 -> 3 -> 1
        if (currentStepValue === 4 && isMonitor) {
          setCurrentStep(3);
        } else if (currentStepValue === 3 && isMonitor && !editingId) {
          setCurrentStep(1);
        } else {
          setCurrentStep(currentStepValue - 1);
        }
      }
    };

    const handleCancel = () => {
      setIsAddingProduct(false);
      setEditingProductId(undefined);
      setCurrentCategory(undefined); // Limpiar categoría al cancelar
      onCancelRef.current();
    };

    setOnBack(handleBack);
    setOnCancel(handleCancel);

    return () => {
      setIsAddingProduct(false);
      setCurrentStep(1);
      setCurrentCategory(undefined); // Limpiar categoría al desmontar
      setEditingProductId(undefined);
      setOnBack(undefined);
      setOnCancel(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingProductId, setProductData, setCurrentCategory]);

  const handleCategorySelect = (category: string) => {
    handleDataChange({ category });
    // Actualizar la categoría en el store
    setCurrentCategory(category);
    // Si es Monitor, saltar directamente al step 3 (technical specs)
    // Si es Computer u otra categoría que requiere OS, ir al step 2
    if (category.toLowerCase() === "monitor") {
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
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
    const category = productData.category?.toLowerCase();
    const isMonitor = category === "monitor";

    // Validaciones antes de avanzar
    if (currentStep === 2 && !isMonitor) {
      // Solo avanzar desde step 2 si NO es Monitor
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Technical specs step - solo quantity es requerido para todas las categorías
      if (!productData.quantity || productData.quantity < 1) return;
      setCurrentStep(4);
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
          screenTechnology: productData.screenTechnology,
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
          screenTechnology: productData.screenTechnology,
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
      // Limpiar categoría y step al completar
      setCurrentCategory(undefined);
      setCurrentStep(1);
      onComplete();
    }
  };

  const renderStep = () => {
    const category = productData.category?.toLowerCase();
    const isMonitor = category === "monitor";

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
        // Solo mostrar OS selection si NO es Monitor
        if (isMonitor) {
          return null;
        }
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
    const category = productData.category?.toLowerCase();
    const isMonitor = category === "monitor";

    if (currentStep === 2 && !isMonitor) {
      // Step 2 (OS selection) - siempre se puede avanzar (puede saltarse)
      return true;
    } else if (currentStep === 3) {
      // Technical specs step - solo quantity es requerido para todas las categorías
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

        {/* Footer - Mostrar en steps 2, 3 y 4 (step 2 solo cuando se edita y NO es Monitor) */}
        {((currentStep === 2 &&
          editingProductId &&
          productData.category?.toLowerCase() !== "monitor") ||
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

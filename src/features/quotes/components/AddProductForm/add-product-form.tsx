"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/shared";
import { useQuoteStore } from "../../store/quote.store";
import { StepCategorySelection } from "../AddProductModal/step-category-selection";
import { StepOSSelection } from "../AddProductModal/step-os-selection";
import { StepTechnicalSpecs } from "../AddProductModal/step-technical-specs";
import { StepAudioSpecs } from "../AddProductModal/step-audio-specs";
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
        // Si es Audio, empezar en step 2 (audio specs)
        // Si es Computer u otra categoría, empezar en step 2 (OS selection)
        const categoryLower = editingProduct.category?.toLowerCase();
        const initialStep =
          categoryLower === "monitor"
            ? 3
            : categoryLower === "audio"
            ? 2
            : 2;
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
      const categoryLower =
        currentCat?.toLowerCase() || editingProduct?.category?.toLowerCase();
      const isMonitor = categoryLower === "monitor";
      const isAudio = categoryLower === "audio";

      // Determinar el step mínimo según si es edición y la categoría
      const minStep = editingId
        ? isMonitor
          ? 3
          : isAudio
          ? 2
          : 2
        : 1;

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
          // Si es Monitor o Audio y vamos al step 1, también limpiar la categoría
          if ((isMonitor || isAudio) && !editingId) {
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
          } else if (isAudio && !editingId) {
            // Si es Audio y vamos al step 2, resetear datos del step 3 (quote details)
            setProductData((prev) => ({
              ...prev,
              country: undefined,
              city: undefined,
              requiredDeliveryDate: undefined,
              additionalComments: undefined,
            }));
          } else {
            // Resetear solo datos del step 3 (technical specs o quote details)
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
          // Resetear datos del step 2 (OS selection o Audio specs)
          if (isAudio) {
            setProductData((prev) => ({
              ...prev,
              quantity: 1,
              brands: [],
              models: [],
              otherSpecifications: undefined,
            }));
          } else {
            setProductData((prev) => ({
              ...prev,
              operatingSystem: undefined,
            }));
          }
        }

        // Navegación especial para Monitor: 4 -> 3 -> 1
        // Navegación especial para Audio: 3 -> 2 -> 1
        if (currentStepValue === 4 && isMonitor) {
          setCurrentStep(3);
        } else if (currentStepValue === 3 && isMonitor && !editingId) {
          setCurrentStep(1);
        } else if (currentStepValue === 3 && isAudio && !editingId) {
          setCurrentStep(2);
        } else if (currentStepValue === 2 && isAudio && !editingId) {
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
    const categoryLower = category.toLowerCase();
    // Si es Monitor, saltar directamente al step 3 (technical specs)
    // Si es Audio, ir al step 2 (audio specs)
    // Si es Computer u otra categoría que requiere OS, ir al step 2 (OS selection)
    if (categoryLower === "monitor") {
      setCurrentStep(3);
    } else if (categoryLower === "audio") {
      setCurrentStep(2);
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
    const isAudio = category === "audio";

    // Validaciones antes de avanzar
    if (currentStep === 2) {
      if (isAudio) {
        // Step 2 para Audio: validar quantity
        if (!productData.quantity || productData.quantity < 1) return;
        setCurrentStep(3);
      } else if (!isMonitor) {
        // Step 2 para Computer u otras categorías: OS selection (siempre se puede avanzar)
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (isAudio) {
        // Step 3 para Audio: Quote Details - validar country y guardar producto
        if (!productData.country) return;

        // Si estamos editando, actualizar el producto existente
        if (editingProductId) {
          updateProduct(editingProductId, {
            quantity: productData.quantity!,
            brands: productData.brands || [],
            models: productData.models || [],
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
            quantity: productData.quantity!,
            brands: productData.brands || [],
            models: productData.models || [],
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
      } else {
        // Technical specs step - solo quantity es requerido para todas las categorías
        if (!productData.quantity || productData.quantity < 1) return;
        setCurrentStep(4);
      }
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
    const isAudio = category === "audio";

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
        // Si es Audio, mostrar StepAudioSpecs
        if (isAudio) {
          return (
            <StepAudioSpecs
              productData={productData}
              onDataChange={handleDataChange}
            />
          );
        }
        // Si es Monitor, no mostrar step 2
        if (isMonitor) {
          return null;
        }
        // Para Computer u otras categorías, mostrar OS selection
        return (
          <StepOSSelection
            selectedOS={productData.operatingSystem || null}
            onOSSelect={handleOSSelect}
            onSkip={handleOSSkip}
          />
        );
      case 3:
        // Si es Audio, mostrar Quote Details
        if (isAudio) {
          return (
            <StepQuoteDetails
              productData={productData}
              onDataChange={handleDataChange}
            />
          );
        }
        // Para otras categorías, mostrar Technical Specs
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
    const isAudio = category === "audio";

    if (currentStep === 2) {
      if (isAudio) {
        // Step 2 para Audio: quantity es requerido
        return !!productData.quantity && productData.quantity >= 1;
      } else if (!isMonitor) {
        // Step 2 (OS selection) - siempre se puede avanzar (puede saltarse)
        return true;
      }
    } else if (currentStep === 3) {
      if (isAudio) {
        // Step 3 para Audio: Quote Details - country es requerido
        return !!productData.country;
      } else {
        // Technical specs step - solo quantity es requerido para todas las categorías
        return !!productData.quantity && productData.quantity >= 1;
      }
    } else if (currentStep === 4) {
      return !!productData.country;
    }
    return true;
  };

  const category = productData.category?.toLowerCase();
  const isAudio = category === "audio";

  return (
    <div className="flex justify-center w-full">
      <div className="bg-white p-6 w-full max-w-4xl">
        {/* Content */}
        <div className="py-6">{renderStep()}</div>

        {/* Footer - Mostrar en steps 2, 3 y 4 */}
        {((currentStep === 2 &&
          (editingProductId ||
            productData.category?.toLowerCase() === "audio")) ||
          (currentStep === 2 &&
            editingProductId &&
            productData.category?.toLowerCase() !== "monitor") ||
          currentStep === 3 ||
          currentStep === 4) && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body={
                currentStep === 4 || (currentStep === 3 && isAudio)
                  ? "Save Product"
                  : "Continue"
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

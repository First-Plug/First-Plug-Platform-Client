"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/shared";
import { useQuoteStore } from "../../store/quote.store";
import { StepCategorySelection } from "../AddProductModal/step-category-selection";
import { StepOSSelection } from "../AddProductModal/step-os-selection";
import { StepComputerSpecs } from "../AddProductModal/step-computer-specs";
import { StepMonitorSpecs } from "../AddProductModal/step-monitor-specs";
import { StepPeripheralsSpecs } from "../AddProductModal/step-peripherals-specs";
import { StepAudioSpecs } from "../AddProductModal/step-audio-specs";
import { StepMerchandisingSpecs } from "../AddProductModal/step-merchandising-specs";
import { StepOtherSpecs } from "../AddProductModal/step-other-specs";
import { StepPhoneSpecs } from "../AddProductModal/step-phone-specs";
import { StepTabletSpecs } from "../AddProductModal/step-tablet-specs";
import { StepFurnitureSpecs } from "../AddProductModal/step-furniture-specs";
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
        // Si es Audio, Peripherals o Phone, empezar en step 2 (specs)
        // Si es Computer u otra categoría, empezar en step 2 (OS selection)
        const categoryLower = editingProduct.category?.toLowerCase();
        const initialStep =
          categoryLower === "monitor"
            ? 3
            : categoryLower === "audio" ||
              categoryLower === "peripherals" ||
              categoryLower === "phone"
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
      const isPeripherals = categoryLower === "peripherals";
      const isMerchandising = categoryLower === "merchandising";
      const isOther = categoryLower === "other";
      const isPhone = categoryLower === "phone";
      const isTablet = categoryLower === "tablet";
      const isFurniture = categoryLower === "furniture";

      // Determinar el step mínimo según si es edición y la categoría
      const minStep = editingId
        ? isMonitor
          ? 3
          : isAudio ||
            isPeripherals ||
            isMerchandising ||
            isOther ||
            isPhone ||
            isTablet ||
            isFurniture
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
          // Determinar a qué step vamos antes de resetear datos
          let nextStep = currentStepValue - 1;
          if (currentStepValue === 3 && isMonitor && !editingId) {
            nextStep = 1;
          } else if (
            currentStepValue === 3 &&
            (isAudio ||
              isPeripherals ||
              isMerchandising ||
              isOther ||
              isPhone ||
              isTablet ||
              isFurniture) &&
            !editingId
          ) {
            nextStep = 2;
          }

          // Si es Monitor y vamos al step 1, limpiar categoría
          if (isMonitor && nextStep === 1 && !editingId) {
            setProductData((prev) => ({
              id: prev.id || generateId(),
              quantity: 1,
              brands: [],
              models: [],
              processors: [],
              category: undefined,
            }));
            setCurrentCategory(undefined);
          } else if (
            isAudio ||
            isPeripherals ||
            isMerchandising ||
            isOther ||
            isPhone ||
            isTablet ||
            isFurniture
          ) {
            // Si es Audio, Peripherals, Merchandising, Other, Phone, Tablet o Furniture y vamos al step 2, solo resetear datos del step 3 (quote details)
            // NO limpiar la categoría ni otherSpecifications (pertenece al step 2)
            setProductData((prev) => ({
              ...prev,
              country: undefined,
              city: undefined,
              requiredDeliveryDate: undefined,
              additionalComments: undefined,
            }));
          } else {
            // Para Computer u otras categorías, resetear datos del step 3 (technical specs)
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
          // Resetear datos del step 2 (OS selection, Audio specs, Peripherals specs, Phone specs, Tablet specs, Furniture specs, Merchandising specs u Other specs)
          if (
            isAudio ||
            isPeripherals ||
            isOther ||
            isPhone ||
            isTablet ||
            isFurniture
          ) {
            setProductData((prev) => ({
              ...prev,
              quantity: 1,
              brands: [],
              models: [],
              screenSize: undefined,
              furnitureType: undefined,
              otherSpecifications: undefined,
            }));
          } else if (isMerchandising) {
            setProductData((prev) => ({
              ...prev,
              quantity: 1,
              description: undefined,
              additionalRequirements: undefined,
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
        // Navegación especial para Audio, Peripherals, Merchandising, Other, Phone, Tablet y Furniture: 3 -> 2 -> 1
        if (currentStepValue === 4 && isMonitor) {
          setCurrentStep(3);
        } else if (currentStepValue === 3 && isMonitor && !editingId) {
          setCurrentStep(1);
        } else if (
          currentStepValue === 3 &&
          (isAudio ||
            isPeripherals ||
            isMerchandising ||
            isOther ||
            isPhone ||
            isTablet ||
            isFurniture) &&
          !editingId
        ) {
          setCurrentStep(2);
        } else if (
          currentStepValue === 2 &&
          (isAudio ||
            isPeripherals ||
            isMerchandising ||
            isOther ||
            isPhone ||
            isTablet ||
            isFurniture) &&
          !editingId
        ) {
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
    // Si es Audio, Peripherals, Phone, Tablet, Furniture, Merchandising u Other, ir al step 2 (specs)
    // Si es Computer u otra categoría que requiere OS, ir al step 2 (OS selection)
    if (categoryLower === "monitor") {
      setCurrentStep(3);
    } else if (
      categoryLower === "audio" ||
      categoryLower === "peripherals" ||
      categoryLower === "phone" ||
      categoryLower === "tablet" ||
      categoryLower === "furniture" ||
      categoryLower === "merchandising" ||
      categoryLower === "other"
    ) {
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
    const isPeripherals = category === "peripherals";
    const isPhone = category === "phone";
    const isTablet = category === "tablet";
    const isFurniture = category === "furniture";

    // Validaciones antes de avanzar
    if (currentStep === 2) {
      if (isAudio || isPeripherals || isPhone || isTablet || isFurniture) {
        // Step 2 para Audio, Peripherals, Phone, Tablet o Furniture: validar quantity
        if (!productData.quantity || productData.quantity < 1) return;
        setCurrentStep(3);
      } else if (!isMonitor) {
        // Step 2 para Computer u otras categorías: OS selection (siempre se puede avanzar)
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (
        isAudio ||
        isPeripherals ||
        isPhone ||
        isTablet ||
        isFurniture ||
        isMerchandising ||
        isOther
      ) {
        // Step 3 para Audio, Peripherals, Merchandising u Other: Quote Details - validar country y guardar producto
        if (!productData.country) return;

        // Si estamos editando, actualizar el producto existente
        if (editingProductId) {
          const updateData: Partial<QuoteProduct> = {
            quantity: productData.quantity!,
            country: productData.country!,
            city: productData.city,
            requiredDeliveryDate: productData.requiredDeliveryDate,
            additionalComments: productData.additionalComments,
          };

          // Campos específicos según categoría
          if (isAudio || isPeripherals || isPhone || isTablet) {
            updateData.brands = productData.brands || [];
            updateData.models = productData.models || [];
            updateData.screenSize = productData.screenSize;
            updateData.otherSpecifications = productData.otherSpecifications;
          } else if (isFurniture) {
            updateData.furnitureType = productData.furnitureType;
            updateData.otherSpecifications = productData.otherSpecifications;
          } else if (isMerchandising) {
            updateData.description = productData.description;
            updateData.additionalRequirements =
              productData.additionalRequirements;
            updateData.otherSpecifications = productData.otherSpecifications;
          }

          updateProduct(editingProductId, updateData);
          setEditingProductId(undefined);
        } else {
          // Si es nuevo producto, agregarlo
          const completeProduct: QuoteProduct = {
            id: productData.id!,
            category: productData.category!,
            quantity: productData.quantity!,
            brands: productData.brands || [],
            models: productData.models || [],
            country: productData.country!,
            city: productData.city,
            requiredDeliveryDate: productData.requiredDeliveryDate,
            additionalComments: productData.additionalComments,
          };

          // Campos específicos según categoría
          if (isAudio || isPeripherals || isPhone || isTablet) {
            completeProduct.screenSize = productData.screenSize;
            completeProduct.otherSpecifications =
              productData.otherSpecifications;
          } else if (isFurniture) {
            completeProduct.furnitureType = productData.furnitureType;
            completeProduct.otherSpecifications =
              productData.otherSpecifications;
          } else if (isMerchandising) {
            completeProduct.description = productData.description;
            completeProduct.additionalRequirements =
              productData.additionalRequirements;
            completeProduct.otherSpecifications =
              productData.otherSpecifications;
          } else if (isOther) {
            completeProduct.otherSpecifications =
              productData.otherSpecifications;
          }

          addProduct(completeProduct);
        }
        // Limpiar categoría, step y productData al completar
        setProductData({
          id: generateId(),
          quantity: 1,
          brands: [],
          models: [],
          processors: [],
        });
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

      const category = productData.category?.toLowerCase();
      const isFurniture = category === "furniture";

      // Si estamos editando, actualizar el producto existente
      if (editingProductId) {
        const updateData: Partial<QuoteProduct> = {
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
          furnitureType: isFurniture ? productData.furnitureType : undefined,
          country: productData.country!,
          city: productData.city,
          requiredDeliveryDate: productData.requiredDeliveryDate,
          additionalComments: productData.additionalComments,
        };
        updateProduct(editingProductId, updateData);
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
          furnitureType: isFurniture ? productData.furnitureType : undefined,
          country: productData.country!,
          city: productData.city,
          requiredDeliveryDate: productData.requiredDeliveryDate,
          additionalComments: productData.additionalComments,
        };
        addProduct(completeProduct);
      }
      // Limpiar categoría, step y productData al completar
      setProductData({
        id: generateId(),
        quantity: 1,
        brands: [],
        models: [],
        processors: [],
      });
      setCurrentCategory(undefined);
      setCurrentStep(1);
      onComplete();
    }
  };

  const renderStep = () => {
    const category = productData.category?.toLowerCase();
    const isMonitor = category === "monitor";
    const isAudio = category === "audio";
    const isPeripherals = category === "peripherals";
    const isPhone = category === "phone";
    const isTablet = category === "tablet";
    const isFurniture = category === "furniture";

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
        // Si es Peripherals, mostrar StepPeripheralsSpecs
        if (isPeripherals) {
          return (
            <StepPeripheralsSpecs
              productData={productData}
              onDataChange={handleDataChange}
            />
          );
        }
        // Si es Phone, mostrar StepPhoneSpecs
        if (isPhone) {
          return (
            <StepPhoneSpecs
              productData={productData}
              onDataChange={handleDataChange}
            />
          );
        }
        // Si es Tablet, mostrar StepTabletSpecs
        if (isTablet) {
          return (
            <StepTabletSpecs
              productData={productData}
              onDataChange={handleDataChange}
            />
          );
        }
        // Si es Furniture, mostrar StepFurnitureSpecs
        if (isFurniture) {
          return (
            <StepFurnitureSpecs
              productData={productData}
              onDataChange={handleDataChange}
            />
          );
        }
        // Si es Merchandising, mostrar StepMerchandisingSpecs
        if (isMerchandising) {
          return (
            <StepMerchandisingSpecs
              productData={productData}
              onDataChange={handleDataChange}
            />
          );
        }
        // Si es Other, mostrar StepOtherSpecs
        if (isOther) {
          return (
            <StepOtherSpecs
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
        // Si es Audio, Peripherals, Phone, Tablet, Furniture, Merchandising u Other, mostrar Quote Details
        if (
          isAudio ||
          isPeripherals ||
          isPhone ||
          isTablet ||
          isFurniture ||
          isMerchandising ||
          isOther
        ) {
          return (
            <StepQuoteDetails
              productData={productData}
              onDataChange={handleDataChange}
            />
          );
        }
        // Para Computer, mostrar Computer Specs
        if (category === "computer") {
          return (
            <StepComputerSpecs
              productData={productData}
              onDataChange={handleDataChange}
            />
          );
        }
        // Para Monitor, mostrar Monitor Specs
        if (isMonitor) {
          return (
            <StepMonitorSpecs
              productData={productData}
              onDataChange={handleDataChange}
            />
          );
        }
        // Por defecto, no mostrar nada (no debería llegar aquí)
        return null;
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
    const isPeripherals = category === "peripherals";
    const isMerchandising = category === "merchandising";
    const isOther = category === "other";
    const isPhone = category === "phone";
    const isTablet = category === "tablet";

    if (currentStep === 2) {
      if (isAudio || isPeripherals || isOther || isPhone || isTablet) {
        // Step 2 para Audio, Peripherals, Other, Phone o Tablet: quantity es requerido
        return !!productData.quantity && productData.quantity >= 1;
      } else if (isMerchandising) {
        // Step 2 para Merchandising: quantity y description son requeridos
        return (
          !!productData.quantity &&
          productData.quantity >= 1 &&
          !!productData.description &&
          productData.description.trim().length > 0
        );
      } else if (!isMonitor) {
        // Step 2 (OS selection) - siempre se puede avanzar (puede saltarse)
        return true;
      }
    } else if (currentStep === 3) {
      if (
        isAudio ||
        isPeripherals ||
        isPhone ||
        isTablet ||
        isMerchandising ||
        isOther
      ) {
        // Step 3 para Audio, Peripherals, Phone, Tablet, Merchandising u Other: Quote Details - country es requerido
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
  const isPeripherals = category === "peripherals";
  const isPhone = category === "phone";
  const isTablet = category === "tablet";
  const isFurniture = category === "furniture";
  const isMerchandising = category === "merchandising";
  const isOther = category === "other";

  return (
    <div className="flex justify-center w-full">
      <div className="bg-white p-6 w-full max-w-4xl">
        {/* Content */}
        <div className="py-6">{renderStep()}</div>

        {/* Footer - Mostrar en steps 2, 3 y 4 */}
        {((currentStep === 2 &&
          (editingProductId ||
            productData.category?.toLowerCase() === "audio" ||
            productData.category?.toLowerCase() === "peripherals" ||
            productData.category?.toLowerCase() === "phone" ||
            productData.category?.toLowerCase() === "tablet" ||
            productData.category?.toLowerCase() === "furniture" ||
            productData.category?.toLowerCase() === "merchandising" ||
            productData.category?.toLowerCase() === "other")) ||
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
                currentStep === 4 ||
                (currentStep === 3 &&
                  (isAudio ||
                    isPeripherals ||
                    isPhone ||
                    isTablet ||
                    isFurniture ||
                    isMerchandising ||
                    isOther))
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

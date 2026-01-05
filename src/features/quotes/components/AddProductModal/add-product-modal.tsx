"use client";

import * as React from "react";
import { X, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Button } from "@/shared";
import { useQuoteStore } from "../../store/quote.store";
import { StepCategorySelection } from "./step-category-selection";
import { StepOSSelection } from "./step-os-selection";
import { StepComputerSpecs } from "./step-computer-specs";
import { StepMonitorSpecs } from "./step-monitor-specs";
import { StepQuoteDetails } from "./step-quote-details";
import type { QuoteProduct } from "../../types/quote.types";
import { useToast } from "@/shared/components/ui/use-toast";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addProduct } = useQuoteStore();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = React.useState(1);
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

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setProductData({
        id: generateId(),
        quantity: 1,
        brands: [],
        models: [],
        processors: [],
      });
    }
  }, [isOpen]);

  // Protección: Si es Monitor y estamos en step 2, redirigir al step 1
  React.useEffect(() => {
    const category = productData.category?.toLowerCase();
    const isMonitor = category === "monitor";
    if (isMonitor && currentStep === 2) {
      setCurrentStep(1);
    }
  }, [currentStep, productData.category, setCurrentStep]);

  const handleDataChange = (updates: Partial<QuoteProduct>) => {
    setProductData((prev) => ({ ...prev, ...updates }));
  };

  const handleCategorySelect = (category: string) => {
    handleDataChange({ category });
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
  };

  const handleOSSkip = () => {
    handleDataChange({ operatingSystem: undefined });
  };

  // Función helper para determinar el número total de pasos según la categoría
  // Por defecto muestra 3, si es Computer muestra 4
  const getTotalSteps = () => {
    if (productData.category?.toLowerCase() === "computer") {
      return 4;
    }
    return 3; // Por defecto 3 pasos (Monitor u otras categorías)
  };

  // Función helper para obtener el paso lógico desde el físico (para mostrar en UI)
  const getLogicalStep = (physicalStep: number): number => {
    if (productData.category?.toLowerCase() === "monitor") {
      // Monitor: 1 -> 3 -> 4 (físicos) mapean a 1 -> 2 -> 3 (lógicos)
      // El step 2 físico no existe para Monitor, así que nunca debería llegar aquí
      if (physicalStep === 1) return 1;
      if (physicalStep === 2) return 1; // Protección: si por alguna razón está en step 2, mostrar como step 1
      if (physicalStep === 3) return 2; // Technical specs (lógico step 2)
      if (physicalStep === 4) return 3; // Quote details (lógico step 3)
    }
    // Computer: 1 -> 2 -> 3 -> 4 (físicos) mapean a 1 -> 2 -> 3 -> 4 (lógicos)
    return physicalStep;
  };

  const handleNext = () => {
    const category = productData.category?.toLowerCase();
    const isMonitor = category === "monitor";

    // Validaciones antes de avanzar
    if (currentStep === 1) {
      if (!productData.category) return;
      // Si es Monitor, saltar directamente al step 3
      setCurrentStep(isMonitor ? 3 : 2);
    } else if (currentStep === 2 && !isMonitor) {
      // Solo avanzar desde step 2 si NO es Monitor
      setCurrentStep(3);
    } else if ((currentStep === 3 && !isMonitor) || (currentStep === 3 && isMonitor)) {
      // Technical specs step (físico 3, pero lógico 2 para Monitor o 3 para Computer)
      // Solo quantity es requerido para todas las categorías
      if (!productData.quantity || productData.quantity < 1) return;
      setCurrentStep(4);
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
      toast({
        title: "Product Added",
        description: "Product added to your quote request.",
      });
      onClose();
    }
  };

  const handleBack = () => {
    const category = productData.category?.toLowerCase();
    const isMonitor = category === "monitor";

    if (currentStep === 4) {
      // Desde quote details, volver a technical specs
      // Resetear datos del step 4
      handleDataChange({
        country: undefined,
        city: undefined,
        requiredDeliveryDate: undefined,
        additionalComments: undefined,
      });
      setCurrentStep(3);
    } else if (currentStep === 3 && !isMonitor) {
      // Desde technical specs (Computer), volver a OS selection
      // Resetear datos del step 3
      handleDataChange({
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
      });
      setCurrentStep(2);
    } else if (currentStep === 3 && isMonitor) {
      // Desde technical specs (Monitor), volver a category selection
      // Resetear datos del step 3
      handleDataChange({
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
      });
      setCurrentStep(1);
    } else if (currentStep === 2 && !isMonitor) {
      // Desde OS selection, volver a category selection (solo si NO es Monitor)
      // Resetear datos del step 2
      handleDataChange({
        operatingSystem: undefined,
      });
      setCurrentStep(1);
    }
  };

  const getStepTitle = () => {
    const category = productData.category?.toLowerCase();
    const isMonitor = category === "monitor";
    
    // Para Monitor, el step 2 físico no debería mostrarse, pero si llegamos aquí mostrar el título correcto
    if (currentStep === 2 && isMonitor) {
      return "Select Product Category"; // Fallback, pero no debería ocurrir
    }
    
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
    const category = productData.category?.toLowerCase();
    const isMonitor = category === "monitor";

    switch (currentStep) {
      case 1:
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
    if (currentStep === 1) {
      return !!productData.category;
    } else if (currentStep === 3) {
      // Solo quantity es requerido para todas las categorías
      return !!productData.quantity && productData.quantity >= 1;
    } else if (currentStep === 4) {
      return !!productData.country;
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <div className="flex items-center gap-4">
            {(() => {
              const category = productData.category?.toLowerCase();
              const isMonitor = category === "monitor";
              const showBackButton = currentStep > 1 && !(currentStep === 2 && isMonitor);
              return showBackButton ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : null;
            })()}
            <div>
              <h2 className="font-semibold text-2xl">{getStepTitle()}</h2>
              <p className="text-muted-foreground text-sm">
                Step {getLogicalStep(currentStep)} of {getTotalSteps()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6">{renderStep()}</div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 1}
            body="Previous"
          />
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            variant="primary"
            body={currentStep === 4 ? "Save Product" : "Continue"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

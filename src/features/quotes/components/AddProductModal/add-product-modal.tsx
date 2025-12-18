"use client";

import * as React from "react";
import { X, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Button } from "@/shared";
import { useQuoteStore } from "../../store/quote.store";
import { StepCategorySelection } from "./step-category-selection";
import { StepOSSelection } from "./step-os-selection";
import { StepTechnicalSpecs } from "./step-technical-specs";
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

  const handleDataChange = (updates: Partial<QuoteProduct>) => {
    setProductData((prev) => ({ ...prev, ...updates }));
  };

  const handleCategorySelect = (category: string) => {
    handleDataChange({ category });
    setCurrentStep(2);
  };

  const handleOSSelect = (os: string) => {
    handleDataChange({ operatingSystem: os });
  };

  const handleOSSkip = () => {
    handleDataChange({ operatingSystem: undefined });
  };

  const handleNext = () => {
    // Validaciones antes de avanzar
    if (currentStep === 1) {
      if (!productData.category) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Validar campos requeridos del step 3
      if (!productData.quantity || productData.quantity < 1) return;
      if (!productData.brands || productData.brands.length === 0) return;
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
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
    if (currentStep === 1) {
      return !!productData.category;
    } else if (currentStep === 3) {
      return (
        !!productData.quantity &&
        productData.quantity >= 1 &&
        !!productData.brands &&
        productData.brands.length > 0
      );
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
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="font-semibold text-2xl">{getStepTitle()}</h2>
              <p className="text-muted-foreground text-sm">
                Step {currentStep} of 4
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

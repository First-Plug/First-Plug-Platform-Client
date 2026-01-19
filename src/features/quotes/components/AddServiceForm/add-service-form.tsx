"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared";
import { useQuoteStore } from "../../store/quote.store";
import { StepServiceTypeSelection } from "../AddServiceModal/step-service-type-selection";
import { StepSelectAsset } from "../AddServiceModal/step-select-asset";
import { StepIssueTypeSelection } from "../AddServiceModal/step-issue-type-selection";
import { StepIssueDetails } from "../AddServiceModal/step-issue-details";
import { StepReviewAndSubmit } from "../AddServiceModal/step-review-and-submit";
import { StepAdditionalDetails } from "../AddServiceModal/step-additional-details";
import { StepBuybackDetails } from "../AddServiceModal/step-buyback-details";
import { StepQuoteDetails } from "../AddProductModal/step-quote-details";
import type { QuoteService, QuoteProduct } from "../../types/quote.types";

interface AddServiceFormProps {
  onCancel: () => void;
  onComplete: () => void;
}

export const AddServiceForm: React.FC<AddServiceFormProps> = ({
  onCancel,
  onComplete,
}) => {
  const {
    addService,
    updateService,
    getService,
    setIsAddingService,
    setCurrentStep,
    setCurrentServiceType,
    currentStep,
    currentServiceType,
    editingServiceId,
    setEditingServiceId,
    setOnBack,
    setOnCancel,
  } = useQuoteStore();

  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  const generateId = () => {
    return `quote-service-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  };

  const [serviceData, setServiceData] = useState<Partial<QuoteService>>({
    id: generateId(),
    impactLevel: "medium", // Preseleccionar "medium" por defecto
  });

  const handleDataChange = (updates: Partial<QuoteService>) => {
    setServiceData((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    setIsAddingService(true);

    // Si hay un servicio en edición, cargar datos y determinar el step inicial
    if (editingServiceId) {
      const editingService = getService(editingServiceId);
      if (editingService) {
        setServiceData(editingService);
        // Establecer el tipo de servicio en el store
        if (editingService.serviceType) {
          setCurrentServiceType(editingService.serviceType);
        }
        // Determinar el step inicial según qué datos tiene
        let initialStep = 2;
        if (editingService.assetId) {
          if (
            editingService.issueTypes &&
            editingService.issueTypes.length > 0
          ) {
            // Si tiene issue types, verificar si tiene description (step 4) o ya pasó a quote details (step 5)
            initialStep = editingService.description ? 5 : 4;
          } else {
            initialStep = 3;
          }
        }
        setCurrentStep(initialStep);
      }
    } else {
      setCurrentStep(1);
      setCurrentServiceType(undefined); // Limpiar tipo de servicio cuando no hay edición
    }

    const handleBack = () => {
      const currentStepValue = useQuoteStore.getState().currentStep;
      const editingId = useQuoteStore.getState().editingServiceId;
      const serviceType = useQuoteStore.getState().currentServiceType;

      // Si estamos editando y estamos en el step mínimo, salir del modo de edición
      const minStep = editingId
        ? serviceType === "it-support" || serviceType === "enrollment"
          ? 2
          : 3
        : 1;
      if (editingId && currentStepValue === minStep) {
        setIsAddingService(false);
        setEditingServiceId(undefined);
        setCurrentServiceType(undefined);
        setCurrentStep(1);
        onCancelRef.current();
        return;
      }

      if (currentStepValue > 1) {
        // Resetear datos del step actual antes de retroceder
        if (currentStepValue === 5) {
          // No resetear nada en step 5 (review), solo retroceder
        } else if (currentStepValue === 4) {
          // Resetear datos del step 4 (issue details para IT Support)
          setServiceData((prev) => ({
            ...prev,
            description: undefined,
            issueStartDate: undefined,
            impactLevel: undefined,
          }));
        } else if (currentStepValue === 3) {
          // Resetear datos del step 3
          if (serviceType === "it-support") {
            // Para IT Support, resetear issue types
            setServiceData((prev) => ({
              ...prev,
              issueTypes: undefined,
            }));
          } else if (serviceType === "enrollment") {
            // Para Enrollment, resetear additional details
            setServiceData((prev) => ({
              ...prev,
              additionalDetails: undefined,
            }));
          }
        } else if (currentStepValue === 2) {
          // Resetear datos del step 2 (select asset)
          if (serviceType === "enrollment") {
            setServiceData((prev) => ({
              ...prev,
              assetIds: undefined,
            }));
          } else {
            setServiceData((prev) => ({
              ...prev,
              assetId: undefined,
            }));
          }
        }

        setCurrentStep(currentStepValue - 1);
      }
    };

    const handleCancel = () => {
      setIsAddingService(false);
      setEditingServiceId(undefined);
      setCurrentServiceType(undefined); // Limpiar tipo de servicio al cancelar
      onCancelRef.current();
    };

    setOnBack(handleBack);
    setOnCancel(handleCancel);

    return () => {
      setIsAddingService(false);
      setCurrentStep(1);
      setCurrentServiceType(undefined); // Limpiar tipo de servicio al desmontar
      setEditingServiceId(undefined);
      setOnBack(undefined);
      setOnCancel(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingServiceId, setServiceData, setCurrentServiceType]);

  const handleServiceTypeSelect = (serviceType: string) => {
    handleDataChange({ serviceType });
    // Actualizar el tipo de servicio en el store
    setCurrentServiceType(serviceType);
    // Si es IT Support, Enrollment o Buyback, ir al step 2 (select asset)
    if (serviceType === "it-support" || serviceType === "enrollment" || serviceType === "buyback") {
      setCurrentStep(2);
    } else {
      setCurrentStep(3);
    }
  };

  const handleAssetSelect = (assetIds: string[]) => {
    const serviceType = serviceData.serviceType || currentServiceType;
    if (serviceType === "enrollment" || serviceType === "buyback") {
      // Para Enrollment y Buyback, guardar múltiples assets
      handleDataChange({ assetIds });
    } else {
      // Para IT Support, solo se permite un asset (single selection)
      const assetId = assetIds.length > 0 ? assetIds[0] : undefined;
      handleDataChange({ assetId });
    }
  };

  const handleContinueFromAssetSelection = () => {
    const serviceType = serviceData.serviceType || currentServiceType;
    if (serviceType === "enrollment") {
      // Para Enrollment, validar que hay al menos un asset seleccionado
      if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;
      // Ir al step 3 (additional details)
      setCurrentStep(3);
    } else if (serviceType === "buyback") {
      // Para Buyback, validar que hay al menos un asset seleccionado
      if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;
      // Ir al step 3 (buyback details)
      setCurrentStep(3);
    } else {
      // Para IT Support, validar que hay un asset seleccionado
      if (!serviceData.assetId) return;
      // Ir al step 3 (issue type)
      setCurrentStep(3);
    }
  };

  const handleIssueTypeToggle = (issueTypeId: string) => {
    const currentIssueTypes = serviceData.issueTypes || [];
    const newIssueTypes = currentIssueTypes.includes(issueTypeId)
      ? currentIssueTypes.filter((id) => id !== issueTypeId)
      : [...currentIssueTypes, issueTypeId];
    handleDataChange({ issueTypes: newIssueTypes });
  };

  const handleContinueFromIssueType = () => {
    // Validar que hay al menos un issue type seleccionado
    if (!serviceData.issueTypes || serviceData.issueTypes.length === 0) return;
    // Ir al step 4 (issue details)
    setCurrentStep(4);
  };

  const handleContinueFromIssueDetails = () => {
    // Validar que hay description (requerido)
    if (!serviceData.description) return;
    // Ir al step 5 (review & submit)
    setCurrentStep(5);
  };

  const handleContinueFromAdditionalDetails = () => {
    // Para Enrollment, step 3 es additional details, guardar y completar
    const completeService: QuoteService = {
      id: serviceData.id!,
      serviceType: serviceData.serviceType!,
      assetIds: serviceData.assetIds || [],
      additionalDetails: serviceData.additionalDetails,
      country: serviceData.country || "",
      city: serviceData.city,
      requiredDeliveryDate: serviceData.requiredDeliveryDate,
      additionalComments: serviceData.additionalComments,
    };
    
    if (editingServiceId) {
      updateService(editingServiceId, completeService);
      setEditingServiceId(undefined);
    } else {
      addService(completeService);
    }
    
    // Limpiar tipo de servicio, step y serviceData al completar
    setServiceData({
      id: generateId(),
      impactLevel: "medium",
    });
    setCurrentServiceType(undefined);
    setCurrentStep(1);
    onComplete();
  };

  const handleContinueFromBuybackDetails = () => {
    // Para Buyback, step 3 es buyback details, validar y completar
    // Validar que hay al menos un asset seleccionado
    if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;

    const completeService: QuoteService = {
      id: serviceData.id!,
      serviceType: serviceData.serviceType!,
      assetIds: serviceData.assetIds || [],
      buybackDetails: serviceData.buybackDetails || {},
      additionalInfo: serviceData.additionalInfo,
      country: serviceData.country || "",
      city: serviceData.city,
      requiredDeliveryDate: serviceData.requiredDeliveryDate,
      additionalComments: serviceData.additionalComments,
    };
    
    if (editingServiceId) {
      updateService(editingServiceId, completeService);
      setEditingServiceId(undefined);
    } else {
      addService(completeService);
    }
    
    // Limpiar tipo de servicio, step y serviceData al completar
    setServiceData({
      id: generateId(),
      impactLevel: "medium",
    });
    setCurrentServiceType(undefined);
    setCurrentStep(1);
    onComplete();
  };

  const handleNext = () => {
    const serviceType = serviceData.serviceType || currentServiceType;
    
    if (currentStep === 5) {
      // Validar campos requeridos del step 5 (review & submit) para IT Support
      if (!serviceData.description || !serviceData.assetId) return;

      // Si estamos editando, actualizar el servicio existente
      if (editingServiceId) {
        const updateData: Partial<QuoteService> = {
          serviceType: serviceData.serviceType!,
          assetId: serviceData.assetId,
          issueTypes: serviceData.issueTypes,
          description: serviceData.description,
          issueStartDate: serviceData.issueStartDate,
          impactLevel: serviceData.impactLevel,
          country: serviceData.country || "",
          city: serviceData.city,
          requiredDeliveryDate: serviceData.requiredDeliveryDate,
          additionalComments: serviceData.additionalComments,
        };
        updateService(editingServiceId, updateData);
        setEditingServiceId(undefined);
      } else {
        // Si es nuevo servicio, agregarlo
        const completeService: QuoteService = {
          id: serviceData.id!,
          serviceType: serviceData.serviceType!,
          assetId: serviceData.assetId,
          issueTypes: serviceData.issueTypes,
          description: serviceData.description,
          issueStartDate: serviceData.issueStartDate,
          impactLevel: serviceData.impactLevel,
          country: serviceData.country || "",
          city: serviceData.city,
          requiredDeliveryDate: serviceData.requiredDeliveryDate,
          additionalComments: serviceData.additionalComments,
        };
        addService(completeService);
      }
      // Limpiar tipo de servicio, step y serviceData al completar
      setServiceData({
        id: generateId(),
        impactLevel: "medium", // Preseleccionar "medium" por defecto
      });
      setCurrentServiceType(undefined);
      setCurrentStep(1);
      onComplete();
    }
  };

  const renderStep = () => {
    const serviceType = serviceData.serviceType || currentServiceType;
    const isITSupport = serviceType === "it-support";
    const isEnrollment = serviceType === "enrollment";
    const isBuyback = serviceType === "buyback";

    switch (currentStep) {
      case 1:
        // No mostrar step 1 si estamos editando
        if (editingServiceId) {
          return null;
        }
        return (
          <StepServiceTypeSelection
            selectedServiceType={serviceData.serviceType || null}
            onServiceTypeSelect={handleServiceTypeSelect}
          />
        );
      case 2:
        // Mostrar select asset si es IT Support, Enrollment o Buyback
        if (isITSupport) {
          return (
            <StepSelectAsset
              selectedAssetIds={
                serviceData.assetId ? [serviceData.assetId] : []
              }
              onAssetSelect={handleAssetSelect}
              allowMultiple={false} // IT Support solo permite un asset
            />
          );
        }
        if (isEnrollment) {
          return (
            <StepSelectAsset
              selectedAssetIds={serviceData.assetIds || []}
              onAssetSelect={handleAssetSelect}
              allowMultiple={true} // Enrollment permite múltiples assets
              allowedCategory="Computer" // Solo Computer para Enrollment
            />
          );
        }
        if (isBuyback) {
          return (
            <StepSelectAsset
              selectedAssetIds={serviceData.assetIds || []}
              onAssetSelect={handleAssetSelect}
              allowMultiple={true} // Buyback permite múltiples assets
            />
          );
        }
        return null;
      case 3:
        // Mostrar issue type si es IT Support
        if (isITSupport) {
          return (
            <StepIssueTypeSelection
              selectedIssueTypes={serviceData.issueTypes || []}
              onIssueTypeToggle={handleIssueTypeToggle}
            />
          );
        }
        // Mostrar additional details si es Enrollment
        if (isEnrollment) {
          return (
            <StepAdditionalDetails
              assetIds={serviceData.assetIds}
              additionalDetails={serviceData.additionalDetails}
              onDataChange={(updates) => {
                handleDataChange(updates);
              }}
            />
          );
        }
        // Mostrar buyback details si es Buyback
        if (isBuyback) {
          return (
            <StepBuybackDetails
              assetIds={serviceData.assetIds || []}
              buybackDetails={serviceData.buybackDetails || {}}
              additionalInfo={serviceData.additionalInfo}
              onDataChange={(updates) => {
                handleDataChange({ buybackDetails: updates });
              }}
              onAdditionalInfoChange={(additionalInfo) => {
                handleDataChange({ additionalInfo });
              }}
            />
          );
        }
        // Para otros servicios, mostrar Quote Details directamente
        const productDataForDetailsOther: Partial<QuoteProduct> = {
          country: serviceData.country,
          city: serviceData.city,
          requiredDeliveryDate: serviceData.requiredDeliveryDate,
          additionalComments: serviceData.additionalComments,
        };
        return (
          <StepQuoteDetails
            productData={productDataForDetailsOther}
            onDataChange={(updates) => {
              handleDataChange({
                country: updates.country,
                city: updates.city,
                requiredDeliveryDate: updates.requiredDeliveryDate,
                additionalComments: updates.additionalComments,
              });
            }}
          />
        );
      case 4:
        // Solo mostrar issue details si es IT Support
        if (isITSupport) {
          return (
            <StepIssueDetails
              description={serviceData.description || ""}
              issueStartDate={serviceData.issueStartDate}
              impactLevel={serviceData.impactLevel || "medium"}
              onDataChange={(updates) => {
                handleDataChange(updates);
              }}
            />
          );
        }
        return null;
      case 5:
        // Solo mostrar review & submit si es IT Support
        if (isITSupport) {
          // Convertir serviceData a QuoteService completo para el review
          const reviewServiceData: QuoteService = {
            id: serviceData.id!,
            serviceType: serviceData.serviceType!,
            assetId: serviceData.assetId,
            issueTypes: serviceData.issueTypes,
            description: serviceData.description,
            issueStartDate: serviceData.issueStartDate,
            impactLevel: serviceData.impactLevel,
            country: serviceData.country || "",
            city: serviceData.city,
            requiredDeliveryDate: serviceData.requiredDeliveryDate,
            additionalComments: serviceData.additionalComments,
          };
          return (
            <StepReviewAndSubmit
              serviceData={reviewServiceData}
              onSubmit={handleNext}
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  const canProceed = () => {
    const serviceType = serviceData.serviceType || currentServiceType;
    const isITSupport = serviceType === "it-support";
    const isEnrollment = serviceType === "enrollment";
    const isBuyback = serviceType === "buyback";

    if (currentStep === 2 && isITSupport) {
      // En step 2 para IT Support, se necesita seleccionar un asset
      return !!serviceData.assetId;
    }
    if (currentStep === 2 && isEnrollment) {
      // En step 2 para Enrollment, se necesita seleccionar al menos un asset
      return !!serviceData.assetIds && serviceData.assetIds.length > 0;
    }
    if (currentStep === 2 && isBuyback) {
      // En step 2 para Buyback, se necesita seleccionar al menos un asset
      return !!serviceData.assetIds && serviceData.assetIds.length > 0;
    }
    if (currentStep === 3 && isITSupport) {
      // En step 3 para IT Support, se necesita seleccionar al menos un issue type
      return !!serviceData.issueTypes && serviceData.issueTypes.length > 0;
    }
    if (currentStep === 3 && isEnrollment) {
      // En step 3 para Enrollment (Additional Details), siempre se puede proceder (es opcional)
      return true;
    }
    if (currentStep === 3 && isBuyback) {
      // En step 3 para Buyback (Buyback Details), siempre se puede proceder (todos los campos son opcionales)
      return true;
    }
    if (currentStep === 3 && !isITSupport && !isEnrollment && !isBuyback) {
      // Para otros servicios, step 3 es Quote Details
      return !!serviceData.country;
    }
    if (currentStep === 4 && isITSupport) {
      // En step 4 para IT Support (Issue Details), se necesita description
      return !!serviceData.description;
    }
    if (currentStep === 5 && isITSupport) {
      // En step 5 para IT Support (Review & Submit), siempre se puede proceder
      return true;
    }
    return true;
  };

  const serviceTypeForRender = serviceData.serviceType || currentServiceType;
  const isITSupportForRender = serviceTypeForRender === "it-support";
  const isEnrollmentForRender = serviceTypeForRender === "enrollment";
  const isBuybackForRender = serviceTypeForRender === "buyback";

  return (
    <div className="flex justify-center w-full">
      <div className="bg-white p-6 w-full max-w-4xl">
        {/* Content */}
        <div className={currentStep === 1 ? "py-6" : "py-6"}>
          {renderStep()}
        </div>

        {/* Footer - Mostrar en step 2 (select asset), step 3 (issue type) y step 4 (quote details) */}
        {currentStep === 2 && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleContinueFromAssetSelection}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Continue"
            />
          </div>
        )}
        {currentStep === 3 && isITSupportForRender && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleContinueFromIssueType}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Continue"
            />
          </div>
        )}
        {currentStep === 3 && isEnrollmentForRender && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleContinueFromAdditionalDetails}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Submit Request"
            />
          </div>
        )}
        {currentStep === 3 && isBuybackForRender && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleContinueFromBuybackDetails}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Submit Request"
            />
          </div>
        )}
        {currentStep === 4 && isITSupportForRender && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleContinueFromIssueDetails}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Continue to Review"
            />
          </div>
        )}
        {currentStep === 5 && isITSupportForRender && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Submit Request"
            />
          </div>
        )}
        {currentStep === 3 && !isITSupportForRender && !isEnrollmentForRender && !isBuybackForRender && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Submit Request"
            />
          </div>
        )}
      </div>
    </div>
  );
};

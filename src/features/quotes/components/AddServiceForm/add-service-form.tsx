"use client";

import { useEffect, useRef, useState } from "react";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { Button } from "@/shared";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useQuoteStore } from "../../store/quote.store";
import { StepServiceTypeSelection } from "../AddServiceModal/step-service-type-selection";
import { StepSelectAsset } from "../AddServiceModal/step-select-asset";
import { StepIssueTypeSelection } from "../AddServiceModal/step-issue-type-selection";
import { StepIssueDetails } from "../AddServiceModal/step-issue-details";
import { StepReviewAndSubmit } from "../AddServiceModal/step-review-and-submit";
import { StepAdditionalDetails } from "../AddServiceModal/step-additional-details";
import { StepBuybackDetails } from "../AddServiceModal/step-buyback-details";
import { StepDataWipeDetails } from "../AddServiceModal/step-data-wipe-details";
import { StepCleaningDetails } from "../AddServiceModal/step-cleaning-details";
import { StepDonationDetails } from "../AddServiceModal/step-donation-details";
import { StepStorageDetails } from "../AddServiceModal/step-storage-details";
import { StepDestructionOptions } from "../AddServiceModal/step-destruction-options";
import { StepShippingDetails } from "../AddServiceModal/step-shipping-details";
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
    onBack,
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
        // Determinar el step inicial según el tipo de servicio y qué datos tiene
        let initialStep = 2;
        const type = editingService.serviceType;

        if (type === "it-support") {
          if (editingService.assetId) {
            if (
              editingService.issueTypes &&
              editingService.issueTypes.length > 0
            ) {
              initialStep = editingService.description ? 5 : 4;
            } else {
              initialStep = 3;
            }
          } else {
            initialStep = 2;
          }
        } else if (
          type === "enrollment" ||
          type === "buyback" ||
          type === "data-wipe" ||
          type === "cleaning" ||
          type === "donations" ||
          type === "storage" ||
          type === "destruction-recycling" ||
          type === "logistics"
        ) {
          // Servicios multi-asset: si ya hay datos del paso 3, arrancar en step 3, si no en step 2
          const hasAssets =
            !!editingService.assetIds && editingService.assetIds.length > 0;
          if (!hasAssets) {
            initialStep = 2;
          } else if (type === "enrollment") {
            initialStep = editingService.additionalDetails ? 3 : 2;
          } else if (type === "buyback") {
            initialStep = editingService.buybackDetails ? 3 : 2;
          } else if (type === "data-wipe") {
            initialStep =
              editingService.dataWipeDetails || editingService.additionalDetails
                ? 3
                : 2;
          } else if (type === "cleaning") {
            initialStep =
              editingService.requiredDeliveryDate ||
              editingService.cleaningType ||
              editingService.additionalDetails ||
              editingService.additionalComments
                ? 3
                : 2;
          } else if (type === "donations") {
            initialStep =
              editingService.donationDataWipe ||
              editingService.donationProfessionalCleaning ||
              editingService.additionalComments
                ? 3
                : 2;
          } else if (type === "storage") {
            initialStep =
              editingService.storageDetails &&
              Object.keys(editingService.storageDetails).length > 0
                ? 3
                : 2;
          } else if (type === "destruction-recycling") {
            initialStep =
              editingService.requiresCertificate !== undefined ||
              (editingService.comments && editingService.comments.trim() !== "")
                ? 3
                : 2;
          } else if (type === "logistics") {
            const hasSameForAll =
              editingService.logisticsDestination &&
              editingService.desirablePickupDate &&
              editingService.desirableDeliveryDate;
            const perAsset = editingService.logisticsDetailsPerAsset || {};
            const assetIds = editingService.assetIds || [];
            const hasPerAsset =
              assetIds.length > 0 &&
              assetIds.every(
                (id) =>
                  perAsset[id]?.logisticsDestination &&
                  perAsset[id]?.desirablePickupDate &&
                  perAsset[id]?.desirableDeliveryDate
              );
            initialStep = hasSameForAll || hasPerAsset ? 3 : 2;
          }
        } else {
          // Otros servicios: default step 3 (quote details)
          initialStep = 3;
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
        ? serviceType === "it-support" ||
          serviceType === "enrollment" ||
          serviceType === "buyback" ||
          serviceType === "data-wipe" ||
          serviceType === "cleaning" ||
          serviceType === "donations" ||
          serviceType === "storage" ||
          serviceType === "destruction-recycling" ||
          serviceType === "logistics"
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
          } else if (serviceType === "donations") {
            // Para Donations, resetear donation options
            setServiceData((prev) => ({
              ...prev,
              donationDataWipe: undefined,
              donationProfessionalCleaning: undefined,
              additionalDetails: undefined,
            }));
          } else if (serviceType === "cleaning") {
            // Para Cleaning, resetear cleaning options
            setServiceData((prev) => ({
              ...prev,
              requiredDeliveryDate: undefined,
              cleaningType: undefined,
              additionalDetails: undefined,
            }));
          } else if (serviceType === "storage") {
            setServiceData((prev) => ({
              ...prev,
              storageDetails: undefined,
              additionalDetails: undefined,
            }));
          } else if (serviceType === "destruction-recycling") {
            setServiceData((prev) => ({
              ...prev,
              requiresCertificate: undefined,
              comments: undefined,
            }));
          } else if (serviceType === "logistics") {
            setServiceData((prev) => ({
              ...prev,
              sameDetailsForAllAssets: false,
              logisticsDestination: undefined,
              desirablePickupDate: undefined,
              desirableDeliveryDate: undefined,
              logisticsDetailsPerAsset: undefined,
              additionalDetails: undefined,
            }));
          }
        } else if (currentStepValue === 2) {
          // Resetear datos del step 2 (select asset)
          if (
            serviceType === "enrollment" ||
            serviceType === "buyback" ||
            serviceType === "data-wipe" ||
            serviceType === "cleaning" ||
            serviceType === "donations" ||
            serviceType === "storage" ||
            serviceType === "destruction-recycling" ||
            serviceType === "logistics"
          ) {
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
    // Si es IT Support, Enrollment, Buyback o Data Wipe, ir al step 2 (select asset)
    if (
      serviceType === "it-support" ||
      serviceType === "enrollment" ||
      serviceType === "buyback" ||
      serviceType === "data-wipe" ||
      serviceType === "cleaning" ||
      serviceType === "donations" ||
      serviceType === "storage" ||
      serviceType === "destruction-recycling" ||
      serviceType === "logistics"
    ) {
      setCurrentStep(2);
    } else {
      setCurrentStep(3);
    }
  };

  const handleAssetSelect = (assetIds: string[]) => {
    const serviceType = serviceData.serviceType || currentServiceType;
    if (
      serviceType === "enrollment" ||
      serviceType === "buyback" ||
      serviceType === "data-wipe" ||
      serviceType === "cleaning" ||
      serviceType === "donations" ||
      serviceType === "storage" ||
      serviceType === "destruction-recycling" ||
      serviceType === "logistics"
    ) {
      // Para Enrollment, Buyback, Data Wipe, Cleaning, Donations, Storage, Destruction & Recycling y Logistics, guardar múltiples assets
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
    } else if (serviceType === "data-wipe") {
      // Para Data Wipe, validar que hay al menos un asset seleccionado
      if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;
      // Ir al step 3 (data wipe details)
      setCurrentStep(3);
    } else if (serviceType === "cleaning") {
      // Para Cleaning, validar que hay al menos un asset seleccionado
      if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;
      // Inicializar cleaningType en Deep por defecto al entrar al step 3
      if (serviceData.cleaningType === undefined) {
        handleDataChange({ cleaningType: "Deep" });
      }
      // Ir al step 3 (cleaning options)
      setCurrentStep(3);
    } else if (serviceType === "donations") {
      // Para Donations, validar que hay al menos un asset seleccionado
      if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;
      // Ir al step 3 (donation options)
      setCurrentStep(3);
    } else if (serviceType === "storage") {
      if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;
      setCurrentStep(3);
    } else if (serviceType === "destruction-recycling") {
      if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;
      if (serviceData.requiresCertificate === undefined) {
        handleDataChange({ requiresCertificate: true });
      }
      setCurrentStep(3);
    } else if (serviceType === "logistics") {
      if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;
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

    // Validar que todos los assets tengan generalFunctionality completado
    if (serviceData.buybackDetails) {
      const missingGeneralFunctionality = serviceData.assetIds.find(
        (assetId) => {
          const detail = serviceData.buybackDetails?.[assetId];
          return (
            !detail?.generalFunctionality ||
            detail.generalFunctionality.trim() === ""
          );
        }
      );

      if (missingGeneralFunctionality) {
        // No continuar si falta generalFunctionality en algún asset
        return;
      }
    } else {
      // Si no hay buybackDetails, no se puede continuar
      return;
    }

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

  const handleContinueFromDataWipeDetails = () => {
    // Para Data Wipe, step 3 es data wipe details, validar y completar
    // Validar que hay al menos un asset seleccionado
    if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;

    const completeService: QuoteService = {
      id: serviceData.id!,
      serviceType: serviceData.serviceType!,
      assetIds: serviceData.assetIds || [],
      dataWipeDetails: serviceData.dataWipeDetails || {},
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

  const handleContinueFromCleaningDetails = () => {
    // Para Cleaning, step 3 es cleaning options, validar y completar
    if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;

    const completeService: QuoteService = {
      id: serviceData.id!,
      serviceType: serviceData.serviceType!,
      assetIds: serviceData.assetIds || [],
      requiredDeliveryDate: serviceData.requiredDeliveryDate,
      cleaningType: serviceData.cleaningType ?? "Deep",
      additionalDetails: serviceData.additionalDetails,
      country: serviceData.country || "",
      city: serviceData.city,
    };

    if (editingServiceId) {
      updateService(editingServiceId, completeService);
      setEditingServiceId(undefined);
    } else {
      addService(completeService);
    }

    setServiceData({
      id: generateId(),
      impactLevel: "medium",
    });
    setCurrentServiceType(undefined);
    setCurrentStep(1);
    onComplete();
  };

  const handleContinueFromDonationDetails = () => {
    if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;

    const completeService: QuoteService = {
      id: serviceData.id!,
      serviceType: serviceData.serviceType!,
      assetIds: serviceData.assetIds || [],
      donationDataWipe: serviceData.donationDataWipe,
      donationProfessionalCleaning: serviceData.donationProfessionalCleaning,
      additionalDetails: serviceData.additionalDetails,
      country: serviceData.country || "",
      city: serviceData.city,
      requiredDeliveryDate: serviceData.requiredDeliveryDate,
    };

    if (editingServiceId) {
      updateService(editingServiceId, completeService);
      setEditingServiceId(undefined);
    } else {
      addService(completeService);
    }

    setServiceData({
      id: generateId(),
      impactLevel: "medium",
    });
    setCurrentServiceType(undefined);
    setCurrentStep(1);
    onComplete();
  };

  const handleContinueFromStorageDetails = () => {
    if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;

    const completeService: QuoteService = {
      id: serviceData.id!,
      serviceType: serviceData.serviceType!,
      assetIds: serviceData.assetIds || [],
      storageDetails: serviceData.storageDetails || {},
      country: serviceData.country || "",
      city: serviceData.city,
      requiredDeliveryDate: serviceData.requiredDeliveryDate,
    };

    if (editingServiceId) {
      updateService(editingServiceId, completeService);
      setEditingServiceId(undefined);
    } else {
      addService(completeService);
    }

    setServiceData({
      id: generateId(),
      impactLevel: "medium",
    });
    setCurrentServiceType(undefined);
    setCurrentStep(1);
    onComplete();
  };

  const handleContinueFromDestructionOptions = () => {
    if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;

    const completeService: QuoteService = {
      id: serviceData.id!,
      serviceType: serviceData.serviceType!,
      assetIds: serviceData.assetIds || [],
      requiresCertificate: serviceData.requiresCertificate ?? true,
      comments: serviceData.comments,
      country: serviceData.country || "",
      city: serviceData.city,
    };

    if (editingServiceId) {
      updateService(editingServiceId, completeService);
      setEditingServiceId(undefined);
    } else {
      addService(completeService);
    }

    setServiceData({
      id: generateId(),
      impactLevel: "medium",
    });
    setCurrentServiceType(undefined);
    setCurrentStep(1);
    onComplete();
  };

  const handleContinueFromShippingDetails = () => {
    if (!serviceData.assetIds || serviceData.assetIds.length === 0) return;
    if (!serviceData.logisticsDestination) return;
    if (!serviceData.desirablePickupDate) return;
    if (!serviceData.desirableDeliveryDate) return;

    const completeService: QuoteService = {
      id: serviceData.id!,
      serviceType: serviceData.serviceType!,
      assetIds: serviceData.assetIds || [],
      logisticsDestination: serviceData.logisticsDestination,
      desirablePickupDate: serviceData.desirablePickupDate,
      desirableDeliveryDate: serviceData.desirableDeliveryDate,
      additionalDetails: serviceData.additionalDetails,
      country: serviceData.country || "",
      city: serviceData.city,
    };

    if (editingServiceId) {
      updateService(editingServiceId, completeService);
      setEditingServiceId(undefined);
    } else {
      addService(completeService);
    }

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
    const isDataWipe = serviceType === "data-wipe";
    const isCleaning = serviceType === "cleaning";
    const isDonations = serviceType === "donations";
    const isStorage = serviceType === "storage";
    const isDestructionRecycling = serviceType === "destruction-recycling";

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
              serviceType="buyback"
            />
          );
        }
        if (isDataWipe) {
          return (
            <StepSelectAsset
              selectedAssetIds={serviceData.assetIds || []}
              onAssetSelect={handleAssetSelect}
              allowMultiple={true}
              allowedCategories={["Computer", "Other"]}
            />
          );
        }
        if (isCleaning) {
          return (
            <StepSelectAsset
              selectedAssetIds={serviceData.assetIds || []}
              onAssetSelect={handleAssetSelect}
              allowMultiple={true}
              allowedCategories={["Computer", "Other"]}
              serviceType="cleaning"
            />
          );
        }
        if (isDonations) {
          return (
            <StepSelectAsset
              selectedAssetIds={serviceData.assetIds || []}
              onAssetSelect={handleAssetSelect}
              allowMultiple={true}
              serviceType="donations"
            />
          );
        }
        if (isStorage) {
          return (
            <StepSelectAsset
              selectedAssetIds={serviceData.assetIds || []}
              onAssetSelect={handleAssetSelect}
              allowMultiple={true}
              serviceType="storage"
              excludeFromWarehouse={true}
            />
          );
        }
        if (isDestructionRecycling) {
          return (
            <StepSelectAsset
              selectedAssetIds={serviceData.assetIds || []}
              onAssetSelect={handleAssetSelect}
              allowMultiple={true}
              serviceType="destruction-recycling"
            />
          );
        }
        if (serviceType === "logistics") {
          return (
            <StepSelectAsset
              selectedAssetIds={serviceData.assetIds || []}
              onAssetSelect={handleAssetSelect}
              allowMultiple={true}
              serviceType="logistics"
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
        // Mostrar data wipe details si es Data Wipe
        if (isDataWipe) {
          return (
            <StepDataWipeDetails
              assetIds={serviceData.assetIds || []}
              dataWipeDetails={serviceData.dataWipeDetails || {}}
              additionalDetails={serviceData.additionalDetails}
              onDataChange={(updates) => {
                handleDataChange({ dataWipeDetails: updates });
              }}
              onAdditionalDetailsChange={(additionalDetails) => {
                handleDataChange({ additionalDetails });
              }}
            />
          );
        }
        // Mostrar cleaning options si es Cleaning
        if (isCleaning) {
          return (
            <StepCleaningDetails
              assetIds={serviceData.assetIds || []}
              requiredDeliveryDate={serviceData.requiredDeliveryDate}
              cleaningType={serviceData.cleaningType ?? "Deep"}
              additionalDetails={
                serviceData.additionalDetails ?? serviceData.additionalComments
              }
              onDataChange={(updates) => {
                handleDataChange(updates);
              }}
            />
          );
        }
        // Mostrar donation options si es Donations
        if (isDonations) {
          return (
            <StepDonationDetails
              assetIds={serviceData.assetIds || []}
              donationDataWipe={serviceData.donationDataWipe}
              donationProfessionalCleaning={
                serviceData.donationProfessionalCleaning
              }
              additionalDetails={serviceData.additionalDetails}
              onDataChange={(updates) => {
                handleDataChange(updates);
              }}
            />
          );
        }
        // Mostrar storage details si es Storage
        if (isStorage) {
          return (
            <StepStorageDetails
              assetIds={serviceData.assetIds || []}
              storageDetails={serviceData.storageDetails || {}}
              onDataChange={(updates) => {
                handleDataChange(updates);
              }}
            />
          );
        }
        // Mostrar destruction options si es Destruction & Recycling
        if (isDestructionRecycling) {
          return (
            <StepDestructionOptions
              assetIds={serviceData.assetIds || []}
              requiresCertificate={serviceData.requiresCertificate ?? true}
              comments={serviceData.comments}
              onDataChange={(updates) => {
                handleDataChange(updates);
              }}
            />
          );
        }
        // Mostrar shipping details si es Logistics
        if (serviceType === "logistics") {
          return (
            <StepShippingDetails
              assetIds={serviceData.assetIds || []}
              sameDetailsForAllAssets={serviceData.sameDetailsForAllAssets ?? false}
              logisticsDestination={serviceData.logisticsDestination}
              desirablePickupDate={serviceData.desirablePickupDate}
              desirableDeliveryDate={serviceData.desirableDeliveryDate}
              logisticsDetailsPerAsset={serviceData.logisticsDetailsPerAsset}
              additionalDetails={serviceData.additionalDetails}
              onDataChange={(updates) => {
                handleDataChange(updates);
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
    const isDataWipe = serviceType === "data-wipe";
    const isCleaning = serviceType === "cleaning";
    const isDonations = serviceType === "donations";
    const isStorage = serviceType === "storage";
    const isDestructionRecycling = serviceType === "destruction-recycling";

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
    if (currentStep === 2 && isDataWipe) {
      // En step 2 para Data Wipe, se necesita seleccionar al menos un asset
      return !!serviceData.assetIds && serviceData.assetIds.length > 0;
    }
    if (currentStep === 2 && isCleaning) {
      // En step 2 para Cleaning, se necesita seleccionar al menos un asset
      return !!serviceData.assetIds && serviceData.assetIds.length > 0;
    }
    if (currentStep === 2 && isDonations) {
      // En step 2 para Donations, se necesita seleccionar al menos un asset
      return !!serviceData.assetIds && serviceData.assetIds.length > 0;
    }
    if (currentStep === 2 && isStorage) {
      return !!serviceData.assetIds && serviceData.assetIds.length > 0;
    }
    if (currentStep === 2 && isDestructionRecycling) {
      return !!serviceData.assetIds && serviceData.assetIds.length > 0;
    }
    if (currentStep === 2 && serviceType === "logistics") {
      return !!serviceData.assetIds && serviceData.assetIds.length > 0;
    }
    if (currentStep === 3 && serviceType === "logistics") {
      const assetIds = serviceData.assetIds || [];
      if (assetIds.length === 0) return false;
      if (serviceData.sameDetailsForAllAssets !== false) {
        return !!(
          serviceData.logisticsDestination &&
          serviceData.desirablePickupDate &&
          serviceData.desirableDeliveryDate
        );
      }
      const perAsset = serviceData.logisticsDetailsPerAsset || {};
      return assetIds.every(
        (id) =>
          perAsset[id]?.logisticsDestination &&
          perAsset[id]?.desirablePickupDate &&
          perAsset[id]?.desirableDeliveryDate
      );
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
      // En step 3 para Buyback (Buyback Details), validar que todos los assets tengan generalFunctionality
      if (!serviceData.assetIds || serviceData.assetIds.length === 0)
        return false;
      if (!serviceData.buybackDetails) return false;

      // Verificar que todos los assets seleccionados tengan generalFunctionality completado
      const allAssetsHaveGeneralFunctionality = serviceData.assetIds.every(
        (assetId) => {
          const detail = serviceData.buybackDetails?.[assetId];
          return (
            detail?.generalFunctionality &&
            detail.generalFunctionality.trim() !== ""
          );
        }
      );

      return allAssetsHaveGeneralFunctionality;
    }
    if (currentStep === 3 && isDataWipe) {
      // En step 3 para Data Wipe (Data Wipe Details), siempre se puede proceder (todos los campos son opcionales)
      return true;
    }
    if (currentStep === 3 && isCleaning) {
      // En step 3 para Cleaning (Cleaning Options), siempre se puede proceder (todos los campos son opcionales)
      return true;
    }
    if (currentStep === 3 && isDonations) {
      return true;
    }
    if (currentStep === 3 && isStorage) {
      return true;
    }
    if (currentStep === 3 && isDestructionRecycling) {
      return true;
    }
    if (
      currentStep === 3 &&
      !isITSupport &&
      !isEnrollment &&
      !isBuyback &&
      !isDataWipe &&
      !isCleaning &&
      !isDonations &&
      !isStorage &&
      !isDestructionRecycling &&
      serviceType !== "logistics"
    ) {
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
  const isDataWipeForRender = serviceTypeForRender === "data-wipe";
  const isCleaningForRender = serviceTypeForRender === "cleaning";
  const isDonationsForRender = serviceTypeForRender === "donations";
  const isStorageForRender = serviceTypeForRender === "storage";
  const isDestructionRecyclingForRender =
    serviceTypeForRender === "destruction-recycling";

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
              body="Save Service"
            />
          </div>
        )}
        {currentStep === 3 && isBuybackForRender && (
          <div className="flex justify-end items-center pt-4 border-t">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      onClick={handleContinueFromBuybackDetails}
                      disabled={!canProceed()}
                      variant="primary"
                      size="small"
                      body="Save Service"
                    />
                  </div>
                </TooltipTrigger>
                {!canProceed() && (
                  <TooltipContent
                    side="top"
                    align="end"
                    className="z-50 bg-blue/80 p-2 rounded-md font-normal text-white text-xs"
                  >
                    Overall condition is required for all assets to continue.
                    <TooltipArrow className="fill-blue/80" />
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        {currentStep === 3 && isDataWipeForRender && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleContinueFromDataWipeDetails}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Save Service"
            />
          </div>
        )}
        {currentStep === 3 && isCleaningForRender && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleContinueFromCleaningDetails}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Save Service"
            />
          </div>
        )}
        {currentStep === 3 && isDonationsForRender && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleContinueFromDonationDetails}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Save Service"
            />
          </div>
        )}
        {currentStep === 3 && isStorageForRender && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleContinueFromStorageDetails}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Save Service"
            />
          </div>
        )}
        {currentStep === 3 && isDestructionRecyclingForRender && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleContinueFromDestructionOptions}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Save Service"
            />
          </div>
        )}
        {currentStep === 3 && serviceTypeForRender === "logistics" && (
          <div className="flex justify-end items-center pt-4 border-t">
            <Button
              onClick={handleContinueFromShippingDetails}
              disabled={!canProceed()}
              variant="primary"
              size="small"
              body="Save Service"
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
              body="Save Service"
            />
          </div>
        )}
        {currentStep === 3 &&
          !isITSupportForRender &&
          !isEnrollmentForRender &&
          !isBuybackForRender &&
          !isDataWipeForRender &&
          !isCleaningForRender &&
          !isDonationsForRender &&
          !isStorageForRender &&
          !isDestructionRecyclingForRender &&
          serviceTypeForRender !== "logistics" && (
            <div className="flex justify-end items-center pt-4 border-t">
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                variant="primary"
                size="small"
                body="Save Service"
              />
            </div>
          )}
      </div>
    </div>
  );
};

"use client";
import React from "react";
import {
  Button,
  SearchInput,
  SessionDropdown,
  ImageProfile,
  ArrowLeft,
} from "@/shared";
import Image from "next/image";
import Logo from "/public/logo1.png";
import { ShopIcon } from "@/shared";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";

import { UserServices } from "@/features/settings";
import { useMemberStore } from "@/features/members";
import { useQuoteStore } from "@/features/quotes";

type NavbarProps = {
  title?: string;
  searchInput?: string;
  placeholder?: string;
};
const Titles = {
  "my-stock": "My Assets",
  "my-team": "My Team",
  activity: "Activity",
  orders: "Orders",
  shipments: "Shipments",
  logistics: "Logistics",
  "unassigned-users": "Unassigned Users",
  "assigned-users": "Assigned Users",
  tenants: "Tenants",
  warehouses: "Warehouses",
  create: "Create Product",
  offices: "Offices",
  "new-request": "New Quote Request",
  history: "Quote History",
} as const;

export const Navbar = ({ title, searchInput, placeholder }: NavbarProps) => {
  const pathName = usePathname();
  const router = useRouter();
  const { status, data } = useSession();
  const pathArray = pathName.split("/");

  const { memberOffBoarding } = useMemberStore();
  const {
    isAddingProduct,
    isAddingService,
    currentStep,
    currentCategory,
    currentServiceType,
    onBack,
    onCancel,
    editingProductId,
    editingServiceId,
    getProduct,
    getService,
  } = useQuoteStore();

  // Obtener la categoría: primero del store, si no está, del producto en edición
  const editingProduct = editingProductId ? getProduct(editingProductId) : null;
  const category =
    currentCategory?.toLowerCase() ||
    editingProduct?.category?.toLowerCase() ||
    "";

  // Obtener el tipo de servicio: primero del store, si no está, del servicio en edición
  const editingService = editingServiceId ? getService(editingServiceId) : null;
  const serviceType =
    currentServiceType?.toLowerCase() ||
    editingService?.serviceType?.toLowerCase() ||
    "";

  const getStepTitle = (step: number) => {
    const stepTitles: Record<number, string> = {
      1: "Select Product Category",
      2: "Select Operating System",
      3: "Technical Specifications",
      4: "Quote Details",
    };
    return stepTitles[step] || "";
  };

  // Función helper para determinar el número total de pasos según la categoría y si se está editando
  const getTotalSteps = () => {
    const isEditing = !!editingProductId;

    // Si estamos editando, usar steps dinámicos según categoría
    if (isEditing) {
      const editCategory =
        editingProduct?.category?.toLowerCase() ||
        currentCategory?.toLowerCase() ||
        category;
      if (editCategory === "computer") {
        return 3; // SO, Datos de computer, Detalles y tiempo
      } else if (editCategory === "monitor") {
        return 2; // Detalles del monitor, Detalles y tiempo
      } else if (
        editCategory === "audio" ||
        editCategory === "peripherals" ||
        editCategory === "phone" ||
        editCategory === "tablet" ||
        editCategory === "furniture" ||
        editCategory === "merchandising" ||
        editCategory === "other"
      ) {
        return 2; // Specs, Detalles y tiempo
      }
    }

    // Si estamos en el step 1 y no estamos editando, siempre mostrar 3 pasos por defecto
    if (currentStep === 1 && !isEditing) {
      return 3;
    }

    // Si no estamos editando y hay categoría seleccionada
    if (category === "computer") {
      return 4; // Categoría, SO, Datos, Detalles
    }
    // Para furniture, phone, tablet, audio, peripherals, merchandising y other: 3 pasos (Categoría, Specs, Detalles)
    if (
      category === "furniture" ||
      category === "phone" ||
      category === "tablet" ||
      category === "audio" ||
      category === "peripherals" ||
      category === "merchandising" ||
      category === "other"
    ) {
      return 3;
    }
    return 3; // Por defecto 3 pasos (Monitor u otras categorías: Categoría, Datos, Detalles)
  };

  // Función helper para obtener el paso lógico desde el físico (para mostrar en UI)
  const getLogicalStep = (physicalStep: number): number => {
    const isEditing = !!editingProductId;

    // Priorizar el modo edición
    if (isEditing) {
      const editCategory =
        editingProduct?.category?.toLowerCase() ||
        currentCategory?.toLowerCase() ||
        category;
      if (editCategory === "monitor") {
        // Monitor en edición: 3 (datos) -> 4 (detalles)
        // Lógicamente: 1 -> 2
        if (physicalStep === 3) return 1; // Detalles del monitor (step 1 lógico)
        if (physicalStep === 4) return 2; // Detalles y tiempo (step 2 lógico)
        if (physicalStep === 2) return 1; // Protección: nunca debería estar aquí
        return 1; // Por defecto para Monitor en edición
      } else if (editCategory === "computer") {
        // Computer en edición: 2 (SO) -> 3 (datos) -> 4 (detalles)
        // Lógicamente: 1 -> 2 -> 3
        if (physicalStep === 2) return 1; // SO (step 1 lógico)
        if (physicalStep === 3) return 2; // Datos de computer (step 2 lógico)
        if (physicalStep === 4) return 3; // Detalles y tiempo (step 3 lógico)
        return 1; // Por defecto para Computer en edición
      } else if (
        editCategory === "audio" ||
        editCategory === "peripherals" ||
        editCategory === "phone" ||
        editCategory === "tablet" ||
        editCategory === "furniture" ||
        editCategory === "merchandising" ||
        editCategory === "other"
      ) {
        // Audio, Peripherals, Phone, Tablet, Furniture, Merchandising u Other en edición: 2 (specs) -> 3 (detalles)
        // Lógicamente: 1 -> 2
        if (physicalStep === 2) return 1; // Specs (step 1 lógico)
        if (physicalStep === 3) return 2; // Detalles y tiempo (step 2 lógico)
        return 1; // Por defecto
      }
    }

    // Modo creación
    if (category === "monitor") {
      // Monitor en creación: 1 (categoría) -> 3 (datos) -> 4 (detalles)
      // Lógicamente: 1 -> 2 -> 3
      if (physicalStep === 1) return 1; // Selección de categoría
      if (physicalStep === 3) return 2; // Datos técnicos (step 2 lógico)
      if (physicalStep === 4) return 3; // Detalles y fechas (step 3 lógico)
      if (physicalStep === 2) return 1; // Protección: nunca debería estar aquí
    } else if (category === "computer") {
      // Computer en creación: 1 (categoría) -> 2 (SO) -> 3 (datos) -> 4 (detalles)
      // Lógicamente: 1 -> 2 -> 3 -> 4
      return physicalStep;
    }

    // Sin categoría aún: mostrar paso físico directamente (por defecto 3 pasos)
    return physicalStep;
  };

  // Función para obtener el título del step según el step lógico y el contexto
  const getStepTitleForDisplay = (physicalStep: number) => {
    const isEditing = !!editingProductId;
    const logicalStep = getLogicalStep(physicalStep);
    const editCategory =
      editingProduct?.category?.toLowerCase() ||
      currentCategory?.toLowerCase() ||
      category;

    // Mapeo de títulos según step lógico y contexto
    if (isEditing) {
      if (editCategory === "monitor") {
        // Monitor en edición: step 1 lógico = Monitor Specifications, step 2 lógico = Quote Details
        const monitorEditTitles: Record<number, string> = {
          1: "Monitor Specifications", // Detalles del monitor
          2: "Quote Details", // Detalles y tiempo
        };
        return monitorEditTitles[logicalStep] || "";
      } else if (editCategory === "computer") {
        // Computer en edición: step 1 lógico = OS, step 2 lógico = Technical Specifications, step 3 lógico = Quote Details
        const computerEditTitles: Record<number, string> = {
          1: "Select Operating System", // SO
          2: "Technical Specifications", // Datos de computer
          3: "Quote Details", // Detalles y tiempo
        };
        return computerEditTitles[logicalStep] || "";
      } else if (editCategory === "peripherals") {
        // Peripherals en edición: step 1 lógico = Peripheral Specifications, step 2 lógico = Quote Details
        const peripheralsEditTitles: Record<number, string> = {
          1: "Peripheral Specifications", // Detalles de peripherals
          2: "Quote Details", // Detalles y tiempo
        };
        return peripheralsEditTitles[logicalStep] || "";
      } else if (editCategory === "audio") {
        // Audio en edición: step 1 lógico = Audio Specifications, step 2 lógico = Quote Details
        const audioEditTitles: Record<number, string> = {
          1: "Audio Specifications", // Detalles de audio
          2: "Quote Details", // Detalles y tiempo
        };
        return audioEditTitles[logicalStep] || "";
      } else if (editCategory === "merchandising") {
        // Merchandising en edición: step 1 lógico = Merchandising Specifications, step 2 lógico = Quote Details
        const merchandisingEditTitles: Record<number, string> = {
          1: "Merchandising Specifications", // Detalles de merchandising
          2: "Quote Details", // Detalles y tiempo
        };
        return merchandisingEditTitles[logicalStep] || "";
      } else if (editCategory === "other") {
        // Other en edición: step 1 lógico = Other Specifications, step 2 lógico = Quote Details
        const otherEditTitles: Record<number, string> = {
          1: "Other Specifications", // Detalles de other
          2: "Quote Details", // Detalles y tiempo
        };
        return otherEditTitles[logicalStep] || "";
      } else if (editCategory === "phone") {
        // Phone en edición: step 1 lógico = Phone Specifications, step 2 lógico = Quote Details
        const phoneEditTitles: Record<number, string> = {
          1: "Phone Specifications", // Detalles de phone
          2: "Quote Details", // Detalles y tiempo
        };
        return phoneEditTitles[logicalStep] || "";
      } else if (editCategory === "tablet") {
        // Tablet en edición: step 1 lógico = Tablet Specifications, step 2 lógico = Quote Details
        const tabletEditTitles: Record<number, string> = {
          1: "Tablet Specifications", // Detalles de tablet
          2: "Quote Details", // Detalles y tiempo
        };
        return tabletEditTitles[logicalStep] || "";
      } else if (editCategory === "furniture") {
        // Furniture en edición: step 1 lógico = Furniture Specifications, step 2 lógico = Quote Details
        const furnitureEditTitles: Record<number, string> = {
          1: "Furniture Specifications", // Detalles de furniture
          2: "Quote Details", // Detalles y tiempo
        };
        return furnitureEditTitles[logicalStep] || "";
      }
    }

    // Para creación (no edición), determinar títulos según categoría y step físico
    if (physicalStep === 1) {
      return "Select Product Category";
    }

    // Step 2: diferentes títulos según categoría
    if (physicalStep === 2) {
      if (category === "computer") {
        return "Select Operating System";
      } else if (category === "audio") {
        return "Audio Specifications";
      } else if (category === "peripherals") {
        return "Peripheral Specifications";
      } else if (category === "phone") {
        return "Phone Specifications";
      } else if (category === "tablet") {
        return "Tablet Specifications";
      } else if (category === "furniture") {
        return "Furniture Specifications";
      } else if (category === "merchandising") {
        return "Merchandising Specifications";
      } else if (category === "other") {
        return "Other Specifications";
      }
      // Por defecto para otras categorías
      return "Technical Specifications";
    }

    // Step 3: diferentes títulos según categoría
    if (physicalStep === 3) {
      if (category === "monitor") {
        return "Monitor Specifications";
      } else if (category === "computer") {
        return "Technical Specifications";
      } else if (
        category === "audio" ||
        category === "peripherals" ||
        category === "phone" ||
        category === "tablet" ||
        category === "furniture" ||
        category === "merchandising" ||
        category === "other"
      ) {
        return "Quote Details";
      }
      return "Technical Specifications";
    }

    // Step 4: siempre Quote Details
    if (physicalStep === 4) {
      return "Quote Details";
    }

    // Por defecto, usar los títulos estándar
    return getStepTitle(physicalStep);
  };

  // Función para obtener el título del step para servicios
  const getServiceStepTitle = (step: number, serviceType?: string) => {
    const isITSupport = serviceType === "it-support";
    const isEnrollment = serviceType === "enrollment";
    const isBuyback = serviceType === "buyback";
    const isDataWipe = serviceType === "data-wipe";
    const isCleaning = serviceType === "cleaning";

    if (isITSupport) {
      const itSupportStepTitles: Record<number, string> = {
        1: "Select Service Type",
        2: "Select Asset",
        3: "Issue Type",
        4: "Issue Details",
        5: "Review & Submit",
      };
      return itSupportStepTitles[step] || "";
    }

    if (isEnrollment) {
      const enrollmentStepTitles: Record<number, string> = {
        1: "Select Service Type",
        2: "Select Devices to Enroll",
        3: "Enrollment Details",
      };
      return enrollmentStepTitles[step] || "";
    }

    if (isBuyback) {
      const buybackStepTitles: Record<number, string> = {
        1: "Select Service Type",
        2: "Select Assets",
        3: "Buyback Details",
      };
      return buybackStepTitles[step] || "";
    }

    if (isDataWipe) {
      const dataWipeStepTitles: Record<number, string> = {
        1: "Select Service Type",
        2: "Select Assets",
        3: "Data Wipe Details",
      };
      return dataWipeStepTitles[step] || "";
    }

    if (isCleaning) {
      const cleaningStepTitles: Record<number, string> = {
        1: "Select Service Type",
        2: "Select Assets",
        3: "Cleaning Options",
      };
      return cleaningStepTitles[step] || "";
    }

    const serviceStepTitles: Record<number, string> = {
      1: "Select Service Type",
      2: "Quote Details",
    };
    return serviceStepTitles[step] || "";
  };

  // Función para obtener el paso lógico para servicios
  const getServiceLogicalStep = (physicalStep: number): number => {
    return physicalStep;
  };

  // Función para obtener el total de pasos para servicios
  const getServiceTotalSteps = (serviceType?: string) => {
    const isITSupport = serviceType === "it-support";
    const isEnrollment = serviceType === "enrollment";
    const isBuyback = serviceType === "buyback";
    const isDataWipe = serviceType === "data-wipe";
    const isCleaning = serviceType === "cleaning";
    if (isITSupport) return 5;
    if (isEnrollment) return 3;
    if (isBuyback) return 3;
    if (isDataWipe) return 3;
    if (isCleaning) return 3;
    return 2;
  };

  const getTitle = () => {
    if (pathArray[3] === "request-off-boarding") {
      return memberOffBoarding ? memberOffBoarding : "";
    }
    // Verificar si la ruta incluye "new-request" y si está en modo agregar servicio
    if (pathArray.includes("new-request") && isAddingService) {
      return getServiceStepTitle(currentStep, currentServiceType);
    }
    // Verificar si la ruta incluye "new-request" y si está en modo agregar producto
    if (pathArray.includes("new-request") && isAddingProduct) {
      return getStepTitleForDisplay(currentStep);
    }
    // Verificar si la ruta incluye "new-request"
    if (pathArray.includes("new-request")) {
      return Titles["new-request"] ?? "";
    }
    // Verificar si la ruta incluye "history" dentro de quotes
    if (pathArray.includes("history") && pathArray.includes("quotes")) {
      return Titles["history"] ?? "";
    }
    return Titles[pathArray[2] as keyof typeof Titles] ?? "";
  };

  // Si está en el flujo de add service, mostrar header dinámico
  if (pathArray.includes("new-request") && isAddingService) {
    const isEditing = !!editingServiceId;
    const isITSupport = currentServiceType === "it-support";
    const isEnrollment = currentServiceType === "enrollment";
    const isBuyback = currentServiceType === "buyback";
    const isDataWipe = currentServiceType === "data-wipe";
    const isCleaning = currentServiceType === "cleaning";
    const minStep = isEditing
      ? isITSupport
        ? 2
        : isEnrollment || isBuyback || isDataWipe || isCleaning
          ? 2
          : 3
      : 1;

    const shouldShowBackButton = onBack && currentStep > minStep;

    return (
      <nav className="flex justify-between items-center px-4 h-[10vh] min-h-[10vh] max-h-[10vh]">
        <div className="flex items-center gap-4">
          {shouldShowBackButton && (
            <button
              type="button"
              onClick={onBack}
              className="hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className={!shouldShowBackButton ? "pl-4" : ""}>
            <h2 className="font-semibold text-black text-2xl">
              {getServiceStepTitle(currentStep, currentServiceType)}
            </h2>
            <p className="text-muted-foreground text-sm">
              Step {getServiceLogicalStep(currentStep)} of{" "}
              {getServiceTotalSteps(currentServiceType)}
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </nav>
    );
  }

  // Si está en el flujo de add product, mostrar header dinámico
  if (pathArray.includes("new-request") && isAddingProduct) {
    const isMonitor = category === "monitor";
    const isEditing = !!editingProductId;
    const minStep = isEditing ? (isMonitor ? 3 : 2) : 1;

    const shouldShowBackButton =
      onBack &&
      currentStep > minStep &&
      !(currentStep === 2 && isMonitor && !isEditing); // No mostrar back si es Monitor en creación y está en step 2

    return (
      <nav className="flex justify-between items-center px-4 h-[10vh] min-h-[10vh] max-h-[10vh]">
        <div className="flex items-center gap-4">
          {shouldShowBackButton && (
            <button
              type="button"
              onClick={onBack}
              className="hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className={!shouldShowBackButton ? "pl-4" : ""}>
            <h2 className="font-semibold text-black text-2xl">
              {getStepTitleForDisplay(currentStep)}
            </h2>
            <p className="text-muted-foreground text-sm">
              Step {getLogicalStep(currentStep)} of {getTotalSteps()}
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </nav>
    );
  }

  // Navbar normal
  return (
    <nav className="flex justify-between items-center px-4 h-[10vh] min-h-[10vh] max-h-[10vh]">
      <div className="flex items-center gap-6">
        {title === "logo" ? (
          <Image src={Logo} alt="Logo" width={140} height={300} priority />
        ) : (
          <h2 className="font-bold text-black text-2xl">{getTitle()}</h2>
        )}

        {searchInput && <SearchInput placeholder={placeholder} />}
      </div>
      {status === "authenticated" && (
        <div className="flex justify-end items-center gap-2">
          <div>
            <Button
              icon={<ShopIcon />}
              body={"Shop"}
              variant={"text"}
              className={"py-2 px-4 bg-none text-sm"}
              onClick={() => {
                const {
                  user: { email, tenantName },
                } = data;

                router.push("/home/quotes/new-request");
                UserServices.notifyShop(email, tenantName);
              }}
            />
          </div>
          <div className="flex items-center gap-2 hover:bg-light-grey rounded-md">
            <div className="relative w-10 h-10">
              <ImageProfile />
            </div>
            <SessionDropdown />
          </div>
        </div>
      )}
    </nav>
  );
};

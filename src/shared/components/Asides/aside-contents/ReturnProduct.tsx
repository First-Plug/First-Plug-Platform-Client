"use client";
import { LOCATION, Location, Product } from "@/features/assets";
import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { ProductDetail } from "@/features/assets";
import { RelocateStatus } from "@/features/assets/components/product-details";
import {
  Button,
  LoaderSpinner,
  CountryFlag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import useActions from "@/shared/hooks/useActions";

import { Member } from "@/features/members";
import { Badge, badgeVariants } from "@/shared";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GenericAlertDialog } from "@/features/assets";
import { buildValidationEntities, validateAfterAction } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useShipmentValues } from "@/features/shipments";
import { ShipmentWithFp } from "@/features/shipments";
import SelectDropdownOptions from "@/shared/components/select-dropdown-options";

import { useAsideStore } from "@/shared";
import { useOffices, useOfficeStore } from "@/features/settings";
import { countriesByCode } from "@/shared/constants/country-codes";
import {
  useInternationalShipmentDetection,
  InternationalShipmentWarning,
} from "@/shared";

interface IRemoveItems {
  product: Product;
  selectedProducts: Product[];
  setSelectedProducts: Dispatch<SetStateAction<Product[]>>;
  isEnabled?: boolean;
  onRemoveSuccess?: () => void;
}
export function ReturnProduct({
  product,
  selectedProducts,
  setSelectedProducts,
  isEnabled,
  onRemoveSuccess,
  className = "",
}: IRemoveItems & { className?: string }) {
  const { closeAside, pushAside } = useAsideStore();
  const { newlyCreatedOffice, clearNewlyCreatedOffice } = useOfficeStore();

  const { shipmentValue, onSubmitDropdown, isShipmentValueValid } =
    useShipmentValues();
  const queryClient = useQueryClient();
  const { offices, isLoading: loadingOffices } = useOffices();
  const { isInternationalShipment, buildInternationalValidationEntities } =
    useInternationalShipmentDetection();
  const [isRemoving, setIsRemoving] = useState(false);
  const [newLocation, setNewLocation] = useState<Location | "FP warehouse">(
    null
  );
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [returnStatus, setReturnStatus] = useState<RelocateStatus>(undefined);
  const [showInternationalWarning, setShowInternationalWarning] =
    useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [genericAlertData, setGenericAlertData] = useState({
    title: "",
    description: "",
    isOpen: false,
  });

  const { unassignProduct } = useActions();

  const sortedOffices = [...offices].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  const ADD_OFFICE_VALUE = "__ADD_OFFICE__";
  const locationOptionGroups = [
    {
      label: "Our offices",
      options: [
        ...sortedOffices.map((office) => {
          const countryName = office.country
            ? countriesByCode[office.country] || office.country
            : "";
          const displayLabel = `${countryName} - ${office.name}`;

          return {
            display: (
              <>
                {office.country && (
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div>
                          <CountryFlag
                            countryName={office.country}
                            size={16}
                            className="rounded-sm"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-blue/80 text-white text-xs">
                        {countryName || office.country}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <span className="truncate">{displayLabel}</span>
              </>
            ),
            value: displayLabel,
          };
        }),
        {
          display: <span className="font-medium text-blue">+ Add Office</span>,
          value: ADD_OFFICE_VALUE,
        },
      ],
    },
  ];

  const router = useRouter();
  const { data: session } = useSession();

  const [showErrorDialogOurOffice, setShowErrorDialogOurOffice] =
    useState(false);

  const [missingOfficeData, setMissingOfficeData] = useState("");

  const selectedMember = queryClient.getQueryData<Member>(["selectedMember"]);

  // Detectar cuando se crea una nueva oficina
  useEffect(() => {
    if (newlyCreatedOffice) {
      // Seleccionar automáticamente la nueva oficina
      const countryName = newlyCreatedOffice.country
        ? countriesByCode[newlyCreatedOffice.country] ||
          newlyCreatedOffice.country
        : "";
      const displayLabel = `${countryName} - ${newlyCreatedOffice.name}`;

      setNewLocation(displayLabel as Location);
      setSelectedOfficeId(newlyCreatedOffice._id);

      // Limpiar la oficina recién creada después de usarla
      clearNewlyCreatedOffice();
    }
  }, [newlyCreatedOffice, clearNewlyCreatedOffice]);

  const handleLocationChange = (displayValue: string) => {
    if (displayValue === ADD_OFFICE_VALUE) {
      pushAside("CreateOffice");
      return;
    }
    setNewLocation(displayValue as Location);

    if (displayValue === "FP warehouse") {
      setSelectedOfficeId(null);
    } else {
      const selectedOffice = sortedOffices.find((office) => {
        const countryName = office.country
          ? countriesByCode[office.country] || office.country
          : "";
        return `${countryName} - ${office.name}` === displayValue;
      });

      if (selectedOffice) {
        setSelectedOfficeId(selectedOffice._id);
      }
    }
  };

  const handleRemoveItems = async (location: Location | "FP warehouse") => {
    if (!location) {
      return;
    }
    const currentHolder = selectedMember;
    if (!Array.isArray(selectedProducts) || selectedProducts.length === 0) {
      return;
    }

    if (!selectedMember || typeof selectedMember !== "object") {
      return;
    }

    const sessionUserData = {
      country: (session?.user as any)?.country,
      city: (session?.user as any)?.city,
      state: (session?.user as any)?.state,
      zipCode: (session?.user as any)?.zipCode,
      address: (session?.user as any)?.address,
      phone: (session?.user as any)?.phone,
    };
    const allMembers = queryClient.getQueryData<Member[]>(["members"]);

    if (!allMembers || allMembers.length === 0) {
      return { source: null, destination: null };
    }

    const { source, destination } = buildInternationalValidationEntities(
      product,
      allMembers,
      null,
      sessionUserData,
      location,
      location === "FP warehouse" ? null : selectedOfficeId
    );

    const missingMessagesForSource = await validateAfterAction(source, null);

    if (missingMessagesForSource.length > 0) {
      const formattedMessages = missingMessagesForSource
        .map(
          (message) =>
            `<div class="mb-2"><span>${message.replace(
              /Current holder \((.*?)\)/,
              "Current holder (<strong>$1</strong>)"
            )}</span></div>`
        )
        .join("");

      setGenericAlertData({
        title: "Details are missing for the current holder",
        description: formattedMessages,
        isOpen: true,
      });
    }

    const missingMessages = await validateAfterAction(source, destination);

    if (missingMessages.length > 0) {
      const formattedMessages = missingMessages
        .map(
          (message) =>
            `<div class="mb-2"><span>${message
              .replace(
                /Current holder \((.*?)\)/,
                "Current holder (<strong>$1</strong>)"
              )
              .replace(
                /Assigned location \((.*?)\)/,
                "Assigned location (<strong>$1</strong>)"
              )}</span></div>`
        )
        .join("");

      setGenericAlertData({
        title: "The return was completed successfully, but details are missing",
        description: formattedMessages,
        isOpen: true,
      });
    }

    const isInternational = isInternationalShipment(source, destination);
    const requiresFpShipment = shipmentValue.shipment === "yes";

    if (isInternational && requiresFpShipment) {
      setPendingAction(() => () => executeReturn());
      setShowInternationalWarning(true);
      return;
    }

    await executeReturn();
  };

  const executeReturn = async () => {
    setIsRemoving(true);
    try {
      const status = (() => {
        if (product.productCondition === "Unusable") return "Unavailable";
        return "Available";
      })() as
        | "Available"
        | "Delivered"
        | "Deprecated"
        | "Unavailable"
        | "In Transit"
        | "In Transit - Missing Data";

      const productToSend = {
        ...product,
        status,
        location:
          newLocation === "FP warehouse" ? "FP warehouse" : "Our office",
        officeId:
          newLocation === "FP warehouse"
            ? undefined
            : selectedOfficeId || undefined,
        fp_shipment: shipmentValue.shipment === "yes",
        desirableDate: {
          origin: shipmentValue.pickupDate,
          destination: shipmentValue.deliveredDate,
        },
      };

      await unassignProduct({
        location:
          newLocation === "FP warehouse" ? "FP warehouse" : "Our office",
        product: productToSend,
        currentMember: selectedMember,
      });

      setReturnStatus("success");

      onRemoveSuccess();
    } catch (error) {
      setReturnStatus("error");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleConfirmInternationalShipment = () => {
    setShowInternationalWarning(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelInternationalShipment = () => {
    setShowInternationalWarning(false);
    setPendingAction(null);
  };

  return (
    <div
      className={`flex flex-col rounded-md pt-[12px] mb-2 px-4 items-start mr-2 gap-1 ${className}`}
    >
      {genericAlertData.isOpen && (
        <GenericAlertDialog
          open={genericAlertData.isOpen}
          onClose={() =>
            setGenericAlertData((prev) => ({ ...prev, isOpen: false }))
          }
          title={genericAlertData.title || "Warning"}
          description={genericAlertData.description || ""}
          buttonText="OK"
          onButtonClick={() =>
            setGenericAlertData((prev) => ({ ...prev, isOpen: false }))
          }
          isHtml={true}
        />
      )}
      <GenericAlertDialog
        open={showErrorDialogOurOffice}
        onClose={() => setShowErrorDialogOurOffice(false)}
        title="Please complete the missing data"
        description={missingOfficeData}
        buttonText="Update"
        onButtonClick={() => {
          closeAside();
          router.push(`/home/settings`);
          setShowErrorDialogOurOffice(false);
        }}
      />

      <div className="w-full">
        <ProductDetail product={product} selectedProducts={selectedProducts} />
      </div>

      <section className="flex items-end gap-4 w-full">
        <div className="flex-1 py-4">
          <SelectDropdownOptions
            label="Please select the new location"
            placeholder={loadingOffices ? "Loading offices..." : "Location"}
            value={newLocation || ""}
            onChange={handleLocationChange}
            options={["FP warehouse"]}
            optionGroups={locationOptionGroups}
            className="max-w-md"
            disabled={loadingOffices}
            required
          />
        </div>

        <div className="flex-1 mb-4">
          <ShipmentWithFp
            onSubmit={onSubmitDropdown}
            destinationMember={null}
          />
        </div>

        <div className="flex-none py-4">
          {returnStatus === "success" ? (
            <Badge className={badgeVariants({ variant: returnStatus })}>
              Returned Succesfully ✅
            </Badge>
          ) : (
            <Button
              onClick={() => handleRemoveItems(newLocation)}
              variant="delete"
              size="small"
              className="py-[14px]"
              disabled={
                isRemoving ||
                !newLocation ||
                !isEnabled ||
                !isShipmentValueValid()
              }
            >
              {!isRemoving ? <span>Return</span> : <LoaderSpinner />}
            </Button>
          )}
        </div>
      </section>

      <InternationalShipmentWarning
        isOpen={showInternationalWarning}
        onConfirm={handleConfirmInternationalShipment}
        onCancel={handleCancelInternationalShipment}
      />
    </div>
  );
}

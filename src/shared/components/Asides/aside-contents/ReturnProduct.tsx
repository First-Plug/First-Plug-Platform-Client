"use client";
import { LOCATION, Location, Product } from "@/features/assets";
import React, { Dispatch, SetStateAction, useState } from "react";
import { ProductDetail } from "@/features/assets";
import { RelocateStatus } from "@/features/assets/components/product-details";
import { Button, LoaderSpinner } from "@/shared";
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
import { useOffices } from "@/features/settings/hooks/use-offices";
import { countriesByCode } from "@/shared/constants/country-codes";

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
  const { closeAside } = useAsideStore();

  const { shipmentValue, onSubmitDropdown, isShipmentValueValid } =
    useShipmentValues();
  const queryClient = useQueryClient();
  const { offices, isLoading: loadingOffices } = useOffices();
  const [isRemoving, setIsRemoving] = useState(false);
  const [newLocation, setNewLocation] = useState<Location | "FP warehouse">(
    null
  );
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [returnStatus, setReturnStatus] = useState<RelocateStatus>(undefined);
  const [genericAlertData, setGenericAlertData] = useState({
    title: "",
    description: "",
    isOpen: false,
  });

  const { unassignProduct } = useActions();

  // Ordenar oficinas para que la por defecto aparezca primero
  const sortedOffices = [...offices].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  // Crear grupos de opciones para el dropdown
  const locationOptionGroups = [
    {
      label: "Our offices",
      options: sortedOffices.map((office) => {
        const countryName = office.country
          ? countriesByCode[office.country] || office.country
          : "";
        return `${countryName} - ${office.name}`;
      }),
    },
  ];

  const router = useRouter();
  const { data: session } = useSession();

  const [showErrorDialogOurOffice, setShowErrorDialogOurOffice] =
    useState(false);

  const [missingOfficeData, setMissingOfficeData] = useState("");

  const selectedMember = queryClient.getQueryData<Member>(["selectedMember"]);

  const handleLocationChange = (displayValue: string) => {
    setNewLocation(displayValue as Location);

    // Si seleccionó FP warehouse, no hay officeId
    if (displayValue === "FP warehouse") {
      setSelectedOfficeId(null);
    } else {
      // Extraer el ID de la oficina del valor seleccionado (formato: "country - name")
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
      console.error("Location is required for return");
      return;
    }
    const currentHolder = selectedMember;
    if (!Array.isArray(selectedProducts) || selectedProducts.length === 0) {
      console.error("No products selected for return");
      return;
    }

    if (!selectedMember || typeof selectedMember !== "object") {
      console.error("Selected member is not valid");
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
      console.error("Member list is empty or unavailable.");
      return { source: null, destination: null };
    }

    const { source, destination } = buildValidationEntities(
      product,
      allMembers,
      null,
      sessionUserData,
      "Our office"
    );

    // Always validate the source (Current Holder)
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

      console.warn("Validation warnings for current holder detected.");
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

      console.warn("Validation warnings for destination detected.");
    }

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
      console.error("Error returning product:", error);
      setReturnStatus("error");
    } finally {
      setIsRemoving(false);
    }
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
    </div>
  );
}

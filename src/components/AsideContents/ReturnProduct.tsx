import { LOCATION, Location, Product, User } from "@/types";
import React, { Dispatch, SetStateAction, useState } from "react";
import ProductDetail, { RelocateStatus } from "@/common/ProductDetail";
import { Button, LoaderSpinner } from "@/common";
import useActions from "@/hooks/useActions";
import { useStore } from "@/models";
import { Member } from "@/features/members";
import { Badge, badgeVariants } from "@/shared";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GenericAlertDialog } from "@/features/assets";
import {
  buildValidationEntities,
  validateAfterAction,
} from "@/lib/validateAfterAction";
import { useQueryClient } from "@tanstack/react-query";
import { useShipmentValues } from "@/features/shipments";
import { ShipmentWithFp } from "@/features/shipments";
import {
  Select,
  SelectLabel,
  SelectOption,
  SelectOptions,
  SelectTrigger,
} from "@/features/shipments";

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
  const {
    alerts: { setAlert },
    aside: { closeAside },
    members: { selectedMember },
  } = useStore();
  const { shipmentValue, onSubmitDropdown, isShipmentValueValid } =
    useShipmentValues();
  const queryClient = useQueryClient();
  const [isRemoving, setIsRemoving] = useState(false);
  const [newLocation, setNewLocation] = useState<Location>(null);
  const [returnStatus, setReturnStatus] = useState<RelocateStatus>(undefined);
  const [genericAlertData, setGenericAlertData] = useState({
    title: "",
    description: "",
    isOpen: false,
  });

  const { unassignProduct } = useActions();

  const router = useRouter();
  const { data: session } = useSession();

  const [showErrorDialogOurOffice, setShowErrorDialogOurOffice] =
    useState(false);

  const [missingOfficeData, setMissingOfficeData] = useState("");

  const handleRemoveItems = async (location: Location) => {
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
      country: session?.user?.country,
      city: session?.user?.city,
      state: session?.user?.state,
      zipCode: session?.user?.zipCode,
      address: session?.user?.address,
      phone: session?.user?.phone,
    };
    const allMembers = queryClient.getQueryData<Member[]>(["members"]);

    if (!allMembers || allMembers.length === 0) {
      console.error("Member list is empty or unavailable.");
      return { source: null, destination: null };
    }

    const { source, destination } = buildValidationEntities(
      product,
      allMembers,
      location === "Our office" ? null : selectedMember,
      sessionUserData,
      location
    );

    // Always validate the source (Current Holder)
    const missingMessagesForSource = validateAfterAction(source, null);

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

    if (location === "Our office") {
      const missingMessages = validateAfterAction(source, destination);

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
          title:
            "The return was completed successfully, but details are missing",
          description: formattedMessages,
          isOpen: true,
        });

        console.warn("Validation warnings for destination detected.");
      }
    }

    setIsRemoving(true);
    try {
      const status = (() => {
        if (product.productCondition === "unusable") return "Unavailable";
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
        fp_shipment: shipmentValue.shipment === "yes",
        desirableDate: {
          origin: shipmentValue.pickupDate,
          destination: shipmentValue.deliveredDate,
        },
      };

      await unassignProduct({
        location,
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
          <Select
            value={newLocation || ""}
            onChange={(value) => setNewLocation(value as Location)}
            className="w-full max-w-md"
          >
            <SelectLabel className="flex items-center gap-2">
              <span className="font-semibold text-dark-grey">
                Please select the new location
              </span>
            </SelectLabel>
            <SelectTrigger className="flex mt-2" placeholder="Location" />
            <SelectOptions>
              {LOCATION.filter((e) => e !== "Employee").map((location) => (
                <SelectOption value={location} key={location}>
                  {location}
                </SelectOption>
              ))}
            </SelectOptions>
          </Select>
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

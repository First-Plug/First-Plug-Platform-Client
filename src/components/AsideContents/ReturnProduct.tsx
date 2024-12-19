import { LOCATION, Location, Product, User } from "@/types";
import React, { Dispatch, SetStateAction, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import ProductDetail, { RelocateStatus } from "@/common/ProductDetail";
import { Button, LoaderSpinner } from "@/common";
import useActions from "@/hooks/useActions";
import { useStore } from "@/models";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge, badgeVariants } from "../ui/badge";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import GenericAlertDialog from "../AddProduct/ui/GenericAlertDialog";
import {
  buildValidationEntities,
  validateAfterAction,
} from "@/lib/validateAfterAction";

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
}: IRemoveItems) {
  const {
    alerts: { setAlert },
    aside: { closeAside },
    members: { selectedMember },
  } = useStore();
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
    };

    const { source, destination } = buildValidationEntities(
      product,
      [],
      null,
      sessionUserData,
      location
    );

    console.log("🔎 Source Entity (Current Holder):", source);
    console.log("🔎 Destination Entity:", destination);

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
      const { source, destination } = buildValidationEntities(
        product,
        [],
        null,
        sessionUserData,
        "Our office"
      );

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
      await unassignProduct({
        location,
        product,
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
    <div className="flex flex-col border-b pb-2 mb-2 rounded-sm items-start gap-1">
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

      <section className="flex justify-between  items-center w-full gap-10 ">
        <Select onValueChange={(value) => setNewLocation(value as Location)}>
          <SelectTrigger
            className="font-semibold text-md w-1/2"
            disabled={returnStatus === "success" || isRemoving}
          >
            <SelectValue placeholder="Please select the new location" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectGroup>
              <SelectLabel>Location</SelectLabel>
              {LOCATION.filter((e) => e !== "Employee").map((location) => (
                <SelectItem value={location} key={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div>
          {returnStatus === "success" ? (
            <Badge className={badgeVariants({ variant: returnStatus })}>
              Returned Succesfully ✅
            </Badge>
          ) : (
            <Button
              onClick={() => handleRemoveItems(newLocation)}
              variant="delete"
              size="small"
              disabled={isRemoving || !newLocation || !isEnabled}
            >
              {!isRemoving ? <span>Return</span> : <LoaderSpinner />}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { Button, LoaderSpinner, SearchInput } from "@/shared";
import { Product, LOCATION, Location } from "@/features/assets";
import { User } from "@/features/auth";
import { Member } from "@/features/members";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared";
import SelectDropdownOptions from "@/shared/components/select-dropdown-options";

import { useQueryClient } from "@tanstack/react-query";
import { useUpdateAsset, GenericAlertDialog } from "@/features/assets";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { validateAfterAction } from "@/shared";
import { useFetchMembers } from "@/features/members";
import { ShipmentWithFp } from "@/features/shipments";
import { useShipmentValues } from "@/features/shipments";
import { Shipment } from "@/features/shipments";
import { useAsideStore, useAlertStore } from "@/shared";
import { CategoryIcons } from "@/features/assets";
import { useOffices } from "@/features/settings/hooks/use-offices";
import { countriesByCode } from "@/shared/constants/country-codes";
import { useInternationalShipmentDetection } from "@/shared/hooks/useInternationalShipmentDetection";
import { InternationalShipmentWarning } from "@/shared/components/InternationalShipmentWarning";

interface BackendResponse extends Product {
  shipment?: Shipment;
}

interface AddMemberFormProps {
  members: Member[];
  selectedMember?: Member | null;
  handleSelectedMembers: (member: Member | null) => void;
  currentProduct?: Product | null;
  currentMember?: Member | null;
  showNoneOption?: boolean;
  actionType?: "AssignProduct" | "ReassignProduct";
}
interface ValidationEntity {
  type: "member" | "office";
  data: Member | (Partial<User> & { location?: string }) | null;
}

export const AddMemberForm = ({
  members = [],
  selectedMember,
  handleSelectedMembers,
  currentProduct,
  currentMember,
  showNoneOption,
  actionType,
}: AddMemberFormProps) => {
  const { shipmentValue, onSubmitDropdown } = useShipmentValues();

  const { data: allMembers, isLoading: loadingMembers } = useFetchMembers();
  const { offices, isLoading: loadingOffices } = useOffices();
  const [searchedMembers, setSearchedMembers] = useState<Member[]>(members);
  const [noneOption, setNoneOption] = useState<string | null>(null);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [genericAlertData, setGenericAlertData] = useState({
    title: "",
    description: "",
  });

  const [isAssigning, setIsAssigning] = useState(false);
  const [showInternationalWarning, setShowInternationalWarning] =
    useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const { setAlert } = useAlertStore();
  const { setAside, closeAside } = useAsideStore();
  const { isInternationalShipment, buildInternationalValidationEntities } =
    useInternationalShipmentDetection();

  const { mutate: updateAssetMutation } = useUpdateAsset();

  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    setSearchedMembers(members);
  }, [members]);

  const handleSearch = (query: string) => {
    setSearchedMembers(
      members.filter(
        (member) =>
          member.firstName.toLowerCase().includes(query.toLowerCase()) ||
          member.lastName.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const displayedMembers = searchedMembers.filter(
    (member) => member.email !== currentMember?.email
  );

  const handleCloseAside = () => {
    setAside(undefined);
    closeAside();
  };

  const handleSaveClick = async () => {
    if (!currentProduct || !actionType) return;

    if (selectedMember === null && !noneOption) {
      setValidationError("Please select a location");
      return;
    }

    if (loadingMembers) {
      return;
    }

    const { source, destination } = buildInternationalValidationEntities(
      currentProduct,
      allMembers || [],
      selectedMember,
      session?.user,
      noneOption,
      selectedOfficeId
    );

    const isInternational = isInternationalShipment(source, destination);
    const requiresFpShipment = shipmentValue.shipment === "yes";

    if (isInternational && requiresFpShipment) {
      setPendingAction(() => () => executeAssignment(source, destination));
      setShowInternationalWarning(true);
      return;
    }

    await executeAssignment(source, destination);
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

  const executeAssignment = async (
    source: { type: "member" | "office" | "warehouse"; data: any } | null,
    destination: { type: "member" | "office" | "warehouse"; data: any } | null
  ) => {
    if (!currentProduct || !actionType) return;

    setIsAssigning(true);

    try {
      const actionLabel =
        actionType === "ReassignProduct"
          ? "Reassign Product"
          : "Assign Product";

      const baseProduct: Partial<Product> & { actionType: string } = {
        assignedEmail: "",
        assignedMember: "",
        status: (() => {
          if (currentProduct.productCondition === "Unusable")
            return currentProduct.status;
          return "Available";
        })(),
        location: noneOption === "FP warehouse" ? "FP warehouse" : "Our office",
        officeId:
          noneOption === "FP warehouse"
            ? undefined
            : selectedOfficeId || undefined,
        category: currentProduct.category,
        attributes: currentProduct.attributes,
        name: currentProduct.name,
        productCondition: currentProduct.productCondition ?? "Optimal",
        actionType: actionType === "ReassignProduct" ? "reassign" : "assign",
        fp_shipment: shipmentValue.shipment === "yes",
        desirableDate: {
          origin: shipmentValue.pickupDate,
          destination: shipmentValue.deliveredDate,
        },
        price: currentProduct.price,
      };

      const updatedProduct = selectedMember
        ? {
            ...baseProduct,
            assignedEmail: selectedMember.email,
            assignedMember: `${selectedMember.firstName} ${selectedMember.lastName}`,
            status: (() => {
              if (currentProduct.productCondition === "Unusable")
                return currentProduct.status;
              return "Delivered";
            })(),
            location: "Employee",
            productCondition: currentProduct.productCondition ?? "Optimal",
            actionType:
              actionType === "ReassignProduct" ? "reassign" : "assign",
          }
        : baseProduct;

      updateAssetMutation(
        {
          id: currentProduct._id,
          data: updatedProduct,
          showSuccessAlert: false,
        },
        {
          onSuccess: async (response: BackendResponse) => {
            const missingMessages = await validateAfterAction(
              source,
              destination
            );

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
                        /Assigned member \((.*?)\)/,
                        "Assigned member (<strong>$1</strong>)"
                      )
                      .replace(
                        /Assigned location \((.*?)\)/,
                        "Assigned location (<strong>$1</strong>)"
                      )}</span></div>`
                )
                .join("");

              setGenericAlertData({
                title:
                  "The assignment was completed successfully, but details are missing",
                description: formattedMessages,
              });
              setShowErrorDialog(true);
            } else {
              setAlert("assignedProductSuccess");
              handleCloseAside();
            }
          },
          onError: (error) => {
            setAlert("errorAssignedProduct");
          },
          onSettled: () => {
            setIsAssigning(false);
          },
        }
      );
    } catch (error) {
      setAlert("errorAssignedProduct");
      setIsAssigning(false);
    }
  };

  const handleSelectNoneOption = (displayValue: string) => {
    handleSelectedMembers(null);
    setNoneOption(displayValue);

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

    setValidationError(null);
  };

  const handleSelectMember = (member: Member | null) => {
    handleSelectedMembers(member);
    setNoneOption(null);
    setSelectedOfficeId(null);
    setValidationError(null);
  };

  const sortedOffices = [...offices].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

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

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showErrorDialogOurOffice, setShowErrorDialogOurOffice] =
    useState(false);
  const [missingMemberData, setMissingMemberData] = useState("");
  const [missingOfficeData, setMissingOfficeData] = useState("");

  return (
    <section className="flex flex-col gap-6 h-full">
      <GenericAlertDialog
        open={showErrorDialog}
        onClose={() => {
          setShowErrorDialog(false);
          if (genericAlertData.description) {
            setAlert("assignedProductSuccess");
            handleCloseAside();
          }
        }}
        title={genericAlertData.title}
        description={genericAlertData.description}
        buttonText="Ok"
        onButtonClick={() => setShowErrorDialog(false)}
        isHtml={true}
        additionalMessage="Please update their details to proceed with the shipment."
      />
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
      <div className="w-full h-[90%]">
        {showNoneOption && (
          <section className="flex flex-col gap-2">
            <span className="font-medium text-dark-grey">
              If you want to <strong>return</strong> this product, please select
              the new Location.
            </span>
            <SelectDropdownOptions
              label="Location"
              placeholder={
                loadingOffices ? "Loading offices..." : "Select Location"
              }
              value={noneOption || ""}
              onChange={(value) => handleSelectNoneOption(value)}
              options={["FP warehouse"]}
              optionGroups={locationOptionGroups}
              className="w-1/2"
              disabled={loadingOffices}
            />

            <hr />
          </section>
        )}
        {validationError && (
          <p className="text-md text-red-500">{validationError}</p>
        )}
        <div
          className={`flex flex-col gap-4 items-start ${
            actionType === "AssignProduct" ? "h-[80%]" : "h-[65%]"
          }`}
        >
          {showNoneOption && (
            <p className="font-medium text-dark-grey">
              If you want to <strong>relocate</strong> this product, please
              select the <strong>employee</strong> to whom this item will be
              assigned.
            </p>
          )}

          <div className="w-full">
            <SearchInput
              placeholder="Search Member"
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2 pt-4 w-full h-full overflow-y-auto scrollbar-custom">
            {displayedMembers.map((member) => (
              <div
                className={`flex gap-2 items-center py-2 px-4 border cursor-pointer rounded-md transition-all duration-300 hover:bg-hoverBlue `}
                key={member._id}
                onClick={() => handleSelectMember(member)}
              >
                <input
                  type="checkbox"
                  checked={member._id === selectedMember?._id}
                />
                <div className="flex gap-2">
                  <p className="font-bold text-black">
                    {member.firstName} {member.lastName}
                  </p>
                  <span className="text-dark-grey">
                    {typeof member.team === "string"
                      ? member.team
                      : member.team?.name}
                  </span>
                  <CategoryIcons products={member.products} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 w-80">
          <ShipmentWithFp
            onSubmit={onSubmitDropdown}
            destinationMember={selectedMember}
          />
        </div>
      </div>

      <aside className="bottom-0 left-0 absolute bg-white py-2 border-t w-full">
        <div className="flex justify-end gap-2 mx-auto w-5/6">
          <Button
            variant="secondary"
            className="px-8"
            onClick={() => setAside(undefined)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="px-8"
            onClick={handleSaveClick}
            disabled={
              (!selectedMember && !noneOption) ||
              isAssigning ||
              !shipmentValue ||
              (shipmentValue &&
                !(
                  shipmentValue.shipment === "yes" ||
                  shipmentValue.shipment === "no"
                ))
            }
          >
            {isAssigning ? <LoaderSpinner /> : "Save"}
          </Button>
        </div>
      </aside>

      <InternationalShipmentWarning
        isOpen={showInternationalWarning}
        onConfirm={handleConfirmInternationalShipment}
        onCancel={handleCancelInternationalShipment}
      />
    </section>
  );
};

"use client";
import React, { useState, useEffect } from "react";
import { Button, LoaderSpinner, SearchInput } from "@/shared";
import { observer } from "mobx-react-lite";
import { Product, LOCATION, Location, User } from "@/types";
import { Member } from "@/features/members";
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
import CategoryIcons from "./AsideContents/EditTeamAside/CategoryIcons";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateAsset } from "@/assets/hooks";
import { useRouter } from "next/navigation";
import GenericAlertDialog from "./AddProduct/ui/GenericAlertDialog";
import { useSession } from "next-auth/react";
import { validateAfterAction } from "@/lib/validateAfterAction";
import { useFetchMembers } from "@/features/members";
import { ShipmentWithFp } from "@/shipments/components";
import { useShipmentValues } from "@/shipments/hooks/useShipmentValues";
import { Shipment } from "@/shipments/interfaces/shipments-response.interface";

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

export const AddMemberForm = observer(
  ({
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
    const [searchedMembers, setSearchedMembers] = useState<Member[]>(members);
    const [noneOption, setNoneOption] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [genericAlertData, setGenericAlertData] = useState({
      title: "",
      description: "",
    });

    const [isAssigning, setIsAssigning] = useState(false);
    const {
      members: { setMemberToEdit },
      products: { reassignProduct },
      alerts: { setAlert },
      aside: { setAside, closeAside },
    } = useStore();

    const queryClient = useQueryClient();
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
            member.lastName.toLowerCase().includes(query.toLowerCase()) ||
            member.email.toLowerCase().includes(query.toLowerCase())
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

      setIsAssigning(true);

      let source: ValidationEntity | null = null;
      let destination: ValidationEntity | null = null;

      try {
        const actionLabel =
          actionType === "ReassignProduct"
            ? "Reassign Product"
            : "Assign Product";

        const currentMemberData = allMembers.find(
          (member) => member.email === currentProduct.assignedEmail
        );

        if (currentMemberData) {
          source = {
            type: "member",
            data: currentMemberData,
          };
        } else if (currentProduct.assignedEmail) {
          const assignedMemberParts = currentProduct.assignedMember
            ? currentProduct.assignedMember.split(" ")
            : ["", ""];
          source = {
            type: "member",
            data: {
              firstName: assignedMemberParts[0] || "",
              lastName: assignedMemberParts[1] || "",
              email: currentProduct.assignedEmail,
            },
          };
        } else if (
          currentProduct.location === "Our office" ||
          currentProduct.location === "FP warehouse"
        ) {
          source = {
            type: "office",
            data: { ...session?.user, location: currentProduct.location },
          };
        } else {
          source = {
            type: "office",
            data: { location: "Unknown" },
          };
        }

        if (selectedMember) {
          destination = {
            type: "member",
            data: selectedMember,
          };
        } else if (noneOption) {
          destination = {
            type: "office",
            data: { ...session?.user, location: noneOption },
          };
        }

        const baseProduct: Partial<Product> & { actionType: string } = {
          assignedEmail: "",
          assignedMember: "",
          status: (() => {
            if (currentProduct.productCondition === "Unusable")
              return currentProduct.status;
            return "Available";
          })(),
          location: noneOption || "Our office",
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
              console.error("Error during save action:", error);
              setAlert("errorAssignedProduct");
            },
            onSettled: () => {
              setIsAssigning(false);
            },
          }
        );
      } catch (error) {
        console.error("Error during save action:", error);
        setAlert("errorAssignedProduct");
        setIsAssigning(false);
      }
    };

    const handleSelectNoneOption = (option: string) => {
      handleSelectedMembers(null);
      setNoneOption(option);
      setValidationError(null);
    };

    const handleSelectMember = (member: Member | null) => {
      handleSelectedMembers(member);
      setNoneOption(null);
      setValidationError(null);
    };

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
                If you want to <strong>return</strong> this product, please
                select the new Location.
              </span>
              <Select
                onValueChange={(value) =>
                  handleSelectNoneOption(value as Location)
                }
                value={noneOption || ""}
              >
                <SelectTrigger className="w-1/2 font-semibold text-md">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    <SelectLabel>Location</SelectLabel>
                    {LOCATION.filter((e) => e !== "Employee").map(
                      (location) => (
                        <SelectItem value={location} key={location}>
                          {location}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>

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
      </section>
    );
  }
);

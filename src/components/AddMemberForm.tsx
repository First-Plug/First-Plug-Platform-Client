"use client";
import React, { useState, useEffect } from "react";
import { Button, LoaderSpinner, SearchInput } from "@/common";
import { observer } from "mobx-react-lite";
import { TeamMember, Product, LOCATION, Location, User } from "@/types";
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
import {
  capitalizeAndSeparateCamelCase,
  getMissingFields,
  validateBillingInfo,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import GenericAlertDialog from "./AddProduct/ui/GenericAlertDialog";
import { useSession } from "next-auth/react";

interface AddMemberFormProps {
  members: TeamMember[];
  selectedMember?: TeamMember | null;
  handleSelectedMembers: (member: TeamMember | null) => void;
  currentProduct?: Product | null;
  currentMember?: TeamMember | null;
  showNoneOption?: boolean;
}

export const AddMemberForm = observer(function ({
  members = [],
  selectedMember,
  handleSelectedMembers,
  currentProduct,
  currentMember,
  showNoneOption,
}: AddMemberFormProps) {
  const [searchedMembers, setSearchedMembers] = useState<TeamMember[]>(members);
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
    if (!currentProduct) return;

    console.log("Starting save action...");
    console.log("Current Product:", currentProduct);

    if (selectedMember === null && !noneOption) {
      setValidationError("Please select a location");
      console.warn("Validation Error: No member or location selected.");
      return;
    }

    let updatedProduct: Partial<Product> = {
      assignedEmail: "",
      assignedMember: "",
      status: "Available",
      location: noneOption,
      category: currentProduct.category,
      attributes: currentProduct.attributes,
      name: currentProduct.name,
    };

    setIsAssigning(true);

    try {
      if (selectedMember === null && noneOption) {
        console.log("Assigning product to location:", noneOption);

        updateAssetMutation({
          id: currentProduct._id,
          data: updatedProduct,
          showSuccessAlert: false,
        });

        console.log("Location assigned successfully.");
        const missingMessages = validateAfterAction();

        if (missingMessages.length > 0) {
          setGenericAlertData({
            title: "Assignment Successful, But Details Missing",
            description: missingMessages.join("\n"),
          });
          setShowErrorDialog(true);
        } else {
          setAlert("assignedProductSuccess");
          handleCloseAside();
        }
      } else if (selectedMember) {
        console.log("Assigning product to member:", selectedMember);

        updatedProduct = {
          ...updatedProduct,
          assignedEmail: selectedMember.email,
          assignedMember: `${selectedMember.firstName} ${selectedMember.lastName}`,
          status: "Delivered",
          location: "Employee",
        };

        updateAssetMutation({
          id: currentProduct._id,
          data: updatedProduct,
          showSuccessAlert: false,
        });

        console.log("Product assigned to member successfully.");
        const missingMessages = validateAfterAction();

        if (missingMessages.length > 0) {
          setGenericAlertData({
            title: "Assignment Successful, But Details Missing",
            description: missingMessages.join("\n"),
          });
          setShowErrorDialog(true);
        } else {
          setAlert("assignedProductSuccess");
          handleCloseAside();
        }
      }
    } catch (error) {
      console.error("Error during save action:", error);
      setAlert("errorAssignedProduct");
    } finally {
      setIsAssigning(false);
      console.log("Save action completed.");
    }
  };

  const validateAfterAction = (): string[] => {
    const missingMessages: string[] = [];

    console.log("Starting validation after action...");

    if (currentMember) {
      console.log("Validating current member (holder):", currentMember);
      const missingFields = getMissingFields(currentMember);
      if (missingFields.length > 0) {
        const fullName = `${currentMember.firstName} ${currentMember.lastName}`;
        missingMessages.push(
          `Current holder (${fullName}) is missing: ${missingFields
            .map((field) => capitalizeAndSeparateCamelCase(field))
            .join(", ")}`
        );
      }
    }

    if (!currentMember && currentProduct.location === "Our office") {
      console.log("Validating billing info for Current Office...");
      const billingValidation = validateBillingInfo(session?.user || {});
      if (!billingValidation.isValid) {
        missingMessages.push(
          `Current holder (Our office) is missing: ${billingValidation.missingFields
            .split(", ")
            .map((field) => capitalizeAndSeparateCamelCase(field))
            .join(", ")}`
        );
      }
    }

    if (selectedMember) {
      console.log("Validating selected member (assignee):", selectedMember);
      const missingFields = getMissingFields(selectedMember);
      if (missingFields.length > 0) {
        const fullName = `${selectedMember.firstName} ${selectedMember.lastName}`;
        missingMessages.push(
          `Assigned member (${fullName}) is missing: ${missingFields
            .map((field) => capitalizeAndSeparateCamelCase(field))
            .join(", ")}`
        );
      }
    }

    if (!selectedMember && noneOption === "Our office") {
      console.log("Validating billing info for Assigned Office...");
      const billingValidation = validateBillingInfo(session?.user || {});
      if (!billingValidation.isValid) {
        missingMessages.push(
          `Assigned location (Our office) is missing: ${billingValidation.missingFields
            .split(", ")
            .map((field) => capitalizeAndSeparateCamelCase(field))
            .join(", ")}`
        );
      }
    }

    console.log("Missing Messages:", missingMessages);

    return missingMessages;
  };

  const handleSelectNoneOption = (option: string) => {
    handleSelectedMembers(null);
    setNoneOption(option);
    setValidationError(null);
  };

  const handleSelectMember = (member: TeamMember | null) => {
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
    <section className="flex flex-col gap-6 h-full ">
      <GenericAlertDialog
        open={showErrorDialog}
        onClose={() => {
          setShowErrorDialog(false);
          if (genericAlertData.description) {
            // After closing the error dialog, show success message
            setAlert("assignedProductSuccess");
            handleCloseAside();
          }
        }}
        title={genericAlertData.title}
        description={genericAlertData.description}
        buttonText="Ok"
        onButtonClick={() => setShowErrorDialog(false)}
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
      <div className="h-[90%] w-full ">
        {showNoneOption && (
          <section className="flex flex-col gap-2">
            <span className="text-dark-grey font-medium">
              If you want to <strong>return</strong> this product, please select
              the new Location.
            </span>
            <Select
              onValueChange={(value) =>
                handleSelectNoneOption(value as Location)
              }
              value={noneOption || ""}
            >
              <SelectTrigger className="font-semibold text-md w-1/2">
                <SelectValue placeholder="Select Location" />
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

            <hr />
          </section>
        )}
        {validationError && (
          <p className="text-red-500 text-md">{validationError}</p>
        )}
        <div className="flex flex-col gap-4 items-start h-[92%]  ">
          {showNoneOption && (
            <p className="text-dark-grey font-medium">
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
          <div className="flex flex-col gap-2 w-full h-[95%] max-h-[95%] overflow-y-auto scrollbar-custom pt-4 ">
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
                  <p className="text-black font-bold">
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
      </div>

      <aside className=" absolute  bg-white  py-2    bottom-0   left-0 w-full border-t ">
        <div className="flex    w-5/6 mx-auto gap-2 justify-end">
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
            disabled={(!selectedMember && !noneOption) || isAssigning}
          >
            {isAssigning ? <LoaderSpinner /> : "Save"}
          </Button>
        </div>
      </aside>
    </section>
  );
});

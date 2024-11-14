import React from "react";
import { DropdownInputProductForm } from "./DropDownProductForm";
import { InputProductForm } from "./InputProductForm";
import { formatMissingFieldsMessage, validateBillingInfo } from "@/lib/utils";
import { User } from "@/types";

interface LocationFieldProps {
  selectedAssignedMember: string;
  user: User;
  setShowErrorDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setMissingMemberData: React.Dispatch<React.SetStateAction<string>>;
  setMissingDataType: React.Dispatch<
    React.SetStateAction<"member" | "billing">
  >;
  selectedLocation?: "Our office" | "FP warehouse" | "Employee";
  onLocationChange: (
    location: "Our office" | "FP warehouse" | "Employee"
  ) => void;
  isLocationEnabled: boolean;
  error?: string;
  clearErrors: (name?: string | string[]) => void;
}

const LocationField: React.FC<LocationFieldProps> = ({
  selectedAssignedMember,
  selectedLocation,
  onLocationChange,
  isLocationEnabled,
  error,
  clearErrors,
  user,
  setShowErrorDialog,
  setMissingMemberData,
  setMissingDataType,
}) => {
  const handleLocationChange = (
    location: "Our office" | "FP warehouse" | "Employee"
  ) => {
    onLocationChange(location);
    clearErrors("location");

    if (selectedAssignedMember === "None" && location === "Our office") {
      const { isValid, missingFields } = validateBillingInfo(user);

      if (!isValid) {
        setMissingMemberData(
          formatMissingFieldsMessage(missingFields.split(", "))
        );
        setMissingDataType("billing");
        setShowErrorDialog(true);
      }
    }
  };
  return selectedAssignedMember === "None" || selectedAssignedMember === "" ? (
    <DropdownInputProductForm
      options={["Our office", "FP warehouse"]}
      placeholder="Select Location"
      title="Location*"
      name="location"
      selectedOption={selectedLocation}
      onChange={handleLocationChange}
      required="required"
      className="w-full"
      disabled={!isLocationEnabled}
    />
  ) : (
    <InputProductForm
      placeholder="Location"
      title="Location"
      type="text"
      name="location"
      value="Employee"
      onChange={(e) => onLocationChange(e.target.value as "Employee")}
      className="w-full"
      readOnly
    />
  );
};

export default LocationField;

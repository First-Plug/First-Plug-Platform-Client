import React from "react";
import { DropdownInputProductForm } from "./DropDownProductForm";
import { InputProductForm } from "./InputProductForm";
import { Location } from "@/types";

interface LocationFieldProps {
  selectedAssignedMember: string;
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
}) => {
  return selectedAssignedMember === "None" || selectedAssignedMember === "" ? (
    <DropdownInputProductForm
      options={["Our office", "FP warehouse"]}
      placeholder="Select Location"
      title="Location*"
      name="location"
      selectedOption={selectedLocation}
      onChange={(value) => {
        onLocationChange(value as "Our office" | "FP warehouse");
        clearErrors("location");
      }}
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

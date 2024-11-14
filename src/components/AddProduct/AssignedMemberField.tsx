import React, { useEffect, useRef, useState } from "react";
import { DropdownInputProductForm } from "./DropDownProductForm";
import { TeamMember } from "@/types";
import { capitalizeAndSeparateCamelCase, getMissingFields } from "@/lib/utils";
import { useStore } from "@/models";
import { useFormContext } from "react-hook-form";

interface AssignedMemberFieldProps {
  fetchedMembers: TeamMember[];
  clearErrors: (name?: string | string[]) => void;
  isDisabled: boolean;
  showErrorDialog: (missingData: string) => void;
  initialSelectedMember: string;
  setSelectedLocation: React.Dispatch<React.SetStateAction<string>>;
  setAssignedEmail: React.Dispatch<React.SetStateAction<string>>;
  isUpdate: boolean;
  setIsLocationEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setMissingMemberData: (data: string) => void;
  setShowErrorDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setMember: React.Dispatch<React.SetStateAction<string>>;
  formState: Record<string, unknown>;
  manualChange: boolean;
  selectedAssignedMember: string;
  setSelectedAssignedMember: React.Dispatch<React.SetStateAction<string>>;
}

const AssignedMemberField: React.FC<AssignedMemberFieldProps> = ({
  fetchedMembers,
  clearErrors,
  isDisabled,
  initialSelectedMember,
  setSelectedLocation,
  setAssignedEmail,
  isUpdate,
  setIsLocationEnabled,
  setMissingMemberData,
  setShowErrorDialog,
  setMember,
  formState,
  manualChange,
  selectedAssignedMember,
  setSelectedAssignedMember,
}) => {
  const { members } = useStore();
  const { setValue } = useFormContext();
  const [assignedEmailOptions, setAssignedEmailOptions] = useState<string[]>(
    []
  );
  const isAsideClosed = useRef(false);

  // aca cargo las opciones de los members en el dropdown
  useEffect(() => {
    if (fetchedMembers) {
      members.setMembers(fetchedMembers);
      const memberFullNames = [
        "None",
        ...fetchedMembers.map(
          (member) => `${member.firstName} ${member.lastName}`
        ),
      ];
      setAssignedEmailOptions(memberFullNames);
    }
  }, [fetchedMembers, members]);

  useEffect(() => {
    setSelectedAssignedMember(initialSelectedMember);
  }, [initialSelectedMember]);

  //al hacer update traigo el value inicial, al seleccionar none cambia el value y habilita el dropdown
  useEffect(() => {
    if (isUpdate && !manualChange) {
      const assignedMember = initialSelectedMember;
      const assignedEmail = formState.assignedEmail as string;

      const selectedMember = fetchedMembers.find(
        (member) => `${member.firstName} ${member.lastName}` === assignedMember
      );

      setSelectedAssignedMember(
        selectedMember ? assignedMember : assignedEmail || "None"
      );
      setValue("assignedMember", assignedMember || "");
      setAssignedEmail(selectedMember?.email || assignedEmail || "");
      setSelectedLocation(formState.location as string);
      setValue("location", formState.location);
    }
  }, [
    isUpdate,
    fetchedMembers,
    initialSelectedMember,
    setValue,
    setAssignedEmail,
    setSelectedLocation,
    manualChange,
  ]);

  const handleAssignedMemberChange = (selectedFullName: string) => {
    setSelectedAssignedMember(selectedFullName);

    if (selectedFullName === "None" || selectedFullName === "") {
      setAssignedEmail("");
      setValue("assignedEmail", "");
      setValue("assignedMember", "");
      setSelectedLocation(undefined);
      setValue("location", undefined);
      setValue("status", "Available");
      if (!isUpdate) {
        setIsLocationEnabled(true);
      }
    } else {
      const selectedMember = members.members.find(
        (member) =>
          `${member.firstName} ${member.lastName}` === selectedFullName
      );

      const email = selectedMember?.email || "";
      setAssignedEmail(email);
      setValue("assignedEmail", email);
      setValue("assignedMember", selectedFullName);
      setSelectedLocation("Employee");
      setValue("location", "Employee");
      setValue("status", "Delivered");
      if (!isUpdate) {
        setIsLocationEnabled(false);
      }

      const missingFields = getMissingFields(selectedMember);
      if (missingFields.length) {
        setMember(selectedMember._id);
        setMissingMemberData(
          missingFields.reduce((acc, field, index) => {
            if (index === 0) {
              return capitalizeAndSeparateCamelCase(field);
            }
            return acc + " - " + capitalizeAndSeparateCamelCase(field);
          }, "")
        );
        setShowErrorDialog(true);
      }
    }

    clearErrors("assignedMember");
    clearErrors("assignedEmail");
  };

  return (
    <div className="w-full">
      <DropdownInputProductForm
        options={assignedEmailOptions}
        placeholder="Assigned Member"
        title="Assigned Member*"
        name="assignedMember"
        selectedOption={selectedAssignedMember}
        onChange={handleAssignedMemberChange}
        searchable={true}
        className="w-full"
        disabled={isDisabled}
      />
    </div>
  );
};

export default AssignedMemberField;

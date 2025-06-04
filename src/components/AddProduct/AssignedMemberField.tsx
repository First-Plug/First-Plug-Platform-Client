import React, { useEffect, useState } from "react";
import { DropdownInputProductForm } from "./DropDownProductForm";

import { capitalizeAndSeparateCamelCase, getMissingFields } from "@/lib/utils";
import { useStore } from "@/models";
import { useFormContext } from "react-hook-form";
import { Member } from "@/features/members";

interface AssignedMemberFieldProps {
  fetchedMembers: Member[];
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
  memberToEdit?: string;
  selectedAssignedMember: string;
  setSelectedAssignedMember: React.Dispatch<React.SetStateAction<string>>;
  setMissingDataType: React.Dispatch<
    React.SetStateAction<"member" | "billing">
  >;
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
  memberToEdit,
  formState,
  manualChange,
  selectedAssignedMember,
  setSelectedAssignedMember,
  setMissingDataType,
}) => {
  const { members } = useStore();
  const { setValue } = useFormContext();
  const [assignedEmailOptions, setAssignedEmailOptions] = useState<string[]>(
    []
  );

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
      const assignedMember =
        fetchedMembers.find(
          (m) => `${m.firstName} ${m.lastName}` === initialSelectedMember
        ) || fetchedMembers.find((m) => m._id === memberToEdit);

      if (assignedMember) {
        setSelectedAssignedMember(
          `${assignedMember.firstName} ${assignedMember.lastName}`
        );
        setValue(
          "assignedMember",
          `${assignedMember.firstName} ${assignedMember.lastName}`
        );
        setAssignedEmail(assignedMember.email || "");
        setSelectedLocation("Employee");
        setValue("location", "Employee");
      } else {
        setSelectedAssignedMember("None");
        setValue("assignedMember", "");
        setSelectedLocation(formState.location as string);
        setValue("location", formState.location);
      }
    }
  }, [
    isUpdate,
    fetchedMembers,
    initialSelectedMember,
    memberToEdit,
    setValue,
    setAssignedEmail,
    setSelectedLocation,
    manualChange,
    formState.location,
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
        setMissingDataType("member");
        setShowErrorDialog(true);
      }
    }

    clearErrors("assignedMember");
    clearErrors("assignedEmail");
  };

  useEffect(() => {
    const updatedMember = members.members.find(
      (member) =>
        `${member.firstName} ${member.lastName}` === selectedAssignedMember
    );

    if (updatedMember) {
      setAssignedEmail(updatedMember.email || "");
      setValue("assignedEmail", updatedMember.email || "");
      setValue(
        "assignedMember",
        `${updatedMember.firstName} ${updatedMember.lastName}`
      );
      setSelectedLocation("Employee");
      setValue("location", "Employee");
    }
  }, [selectedAssignedMember, members.members]);

  useEffect(() => {
    setSelectedAssignedMember(initialSelectedMember);
  }, [initialSelectedMember, fetchedMembers]);

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

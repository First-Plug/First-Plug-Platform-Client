"use client";
import React, { useState, useEffect } from "react";
import { DropdownInputProductForm } from "./DropDownProductForm";
import { InputProductForm } from "./InputProductForm";
import { useStore } from "@/models";
import { observer } from "mobx-react-lite";
import { Location, CATEGORIES, Category } from "@/types";
import { FieldValues, useFormContext } from "react-hook-form";
import { setAuthInterceptor } from "@/config/axios.config";
import { Memberservices } from "@/services";
import { Skeleton } from "../ui/skeleton";

interface CategoryFormProps {
  handleCategoryChange: (category: Category | "") => void;
  selectedCategory: Category | "";
  setAssignedEmail: (email: string) => void;
  formState: Record<string, unknown>;
  clearErrors: (name?: keyof FieldValues | (keyof FieldValues)[]) => void;
  isUpdate?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = function ({
  handleCategoryChange,
  selectedCategory,
  setAssignedEmail,
  formState,
  clearErrors,
  isUpdate,
}) {
  const { members } = useStore();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const [selectedAssignedMember, setSelectedAssignedMember] =
    useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  const [assignedEmailOptions, setAssignedEmailOptions] = useState<string[]>(
    []
  );

  useEffect(() => {
    const fetchAllData = async () => {
      if (sessionStorage.getItem("accessToken")) {
        try {
          setAuthInterceptor(sessionStorage.getItem("accessToken"));
          const fetchedMembers = await Memberservices.getAllMembers();

          if (fetchedMembers && fetchedMembers.length > 0) {
            members.setMembers(fetchedMembers);
          }

          if (isUpdate) {
            const assignedMember = formState.assignedMember as string;
            const assignedEmail = formState.assignedEmail as string;

            const selectedMember = fetchedMembers.find(
              (member) =>
                `${member.firstName} ${member.lastName}` === assignedMember
            );

            setSelectedAssignedMember(
              selectedMember
                ? assignedMember
                : assignedEmail
                ? assignedEmail
                : "None"
            );
            setValue("assignedMember", assignedMember);

            setAssignedEmail(selectedMember?.email || assignedEmail || "");

            const location = formState.location as string;
            setSelectedLocation(location);
            setValue("location", location);

            const memberFullNames = [
              "None",
              ...fetchedMembers.map(
                (member) => `${member.firstName} ${member.lastName}`
              ),
            ];

            if (
              assignedEmail &&
              !selectedMember &&
              !memberFullNames.includes(assignedEmail)
            ) {
              memberFullNames.push(assignedEmail);
            }

            const filteredEmailOptions = memberFullNames.filter(
              (email) => email !== assignedEmail
            );

            setAssignedEmailOptions(filteredEmailOptions);
          } else {
            const memberFullNames = [
              "None",
              ...fetchedMembers.map(
                (member) => `${member.firstName} ${member.lastName}`
              ),
            ];

            setAssignedEmailOptions(memberFullNames);
          }
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAllData();
  }, [isUpdate, formState, members, setValue, setAssignedEmail]);

  const handleInputChange = (name: keyof FieldValues, value: string) => {
    setValue(name, value);
    clearErrors(name);
  };

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
    }
    clearErrors("assignedMember");
    clearErrors("assignedEmail");
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col gap-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="flex-grow w-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={`grid gap-4 ${
          isUpdate ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"
        }`}
      >
        <div className="w-full lg:w-full">
          <DropdownInputProductForm
            options={CATEGORIES}
            placeholder="Category"
            title="Category*"
            name="category"
            selectedOption={selectedCategory}
            onChange={(category: Category) => {
              handleCategoryChange(category);
              clearErrors("category");
            }}
            required="required"
            disabled={isUpdate}
          />
          <div className="min-h-[24px]">
            {errors.category && (
              <p className="text-red-500">{(errors.category as any).message}</p>
            )}
          </div>
        </div>
        <div className="w-full ">
          <DropdownInputProductForm
            options={assignedEmailOptions}
            placeholder="Assigned Member"
            title="Assigned Member*"
            name="assignedMember"
            selectedOption={selectedAssignedMember}
            onChange={handleAssignedMemberChange}
            className="w-full "
          />
          <div className="min-h-[24px]">
            {errors.assignedEmail && (
              <p className="text-red-500">
                {(errors.assignedEmail as any).message}
              </p>
            )}
          </div>
        </div>

        <div className="w-full">
          {selectedAssignedMember === "None" ||
          selectedAssignedMember === "" ? (
            <>
              <DropdownInputProductForm
                options={["Our office", "FP warehouse"]}
                placeholder="Location"
                title="Location*"
                name="location"
                selectedOption={selectedLocation}
                onChange={(value: Location) => {
                  setSelectedLocation(value);
                  setValue("location", value);
                  clearErrors("location");
                }}
                required="required"
                className="w-full"
                disabled={!isLocationEnabled}
              />
              <div className="min-h-[24px]">
                {errors.location && (
                  <p className="text-red-500">
                    {(errors.location as any).message}
                  </p>
                )}
              </div>
            </>
          ) : (
            <InputProductForm
              placeholder="Location"
              title="Location"
              type="text"
              name="location"
              value="Employee"
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full"
              readOnly={selectedLocation === "Employee"}
            />
          )}
        </div>
      </div>
      <div
        className={`grid gap-4 mt-4 ${
          isUpdate ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 lg:grid-cols-4"
        }`}
      >
        <div className="w-full">
          <InputProductForm
            placeholder="Acquisition Date"
            title="Acquisition Date"
            type="date"
            value={
              watch("acquisitionDate")
                ? (watch("acquisitionDate") as string).split("T")[0]
                : ""
            }
            name="acquisitionDate"
            allowFutureDates={false}
            onChange={(e) =>
              handleInputChange(
                "acquisitionDate",
                new Date(e.target.value).toISOString()
              )
            }
          />
        </div>
        <div className="w-full">
          <InputProductForm
            placeholder="Serial Number"
            title="Serial Number"
            type="text"
            value={watch("serialNumber") as string}
            name="serialNumber"
            onChange={(e) => handleInputChange("serialNumber", e.target.value)}
            className="w-full "
          />
        </div>
      </div>
    </div>
  );
};

export default observer(CategoryForm);

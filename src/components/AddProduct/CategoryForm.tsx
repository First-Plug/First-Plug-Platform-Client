"use client";
import React, { useState, useEffect, useRef } from "react";
import { DropdownInputProductForm } from "./DropDownProductForm";
import { InputProductForm } from "./InputProductForm";
import { useStore } from "@/models";
import { observer } from "mobx-react-lite";
import { Location, CATEGORIES, Category } from "@/types";
import { FieldValues, useFormContext } from "react-hook-form";
import { Skeleton } from "../ui/skeleton";
import QuantityCounter from "./QuantityCounter";
import RecoverableSwitch from "./RecoverableSwitch";
import { useFetchMembers } from "@/members/hooks";
import GenericAlertDialog from "./ui/GenericAlertDialog";
import { capitalizeAndSeparateCamelCase, getMissingFields } from "@/lib/utils";
import PriceInput from "./PriceInput";
import LocationField from "./LocationField";

interface CategoryFormProps {
  handleCategoryChange: (category: Category | "") => void;
  selectedCategory: Category | "";
  setAssignedEmail: (email: string) => void;
  formState: Record<string, unknown>;
  clearErrors: (name?: keyof FieldValues | (keyof FieldValues)[]) => void;
  isUpdate?: boolean;
  quantity: number;
  setQuantity: (value: number) => void;
  model: string;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<any>>;
  manualChange: boolean;
  setManualChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

const CategoryForm: React.FC<CategoryFormProps> = function ({
  handleCategoryChange,
  selectedCategory,
  setAssignedEmail,
  formState,
  clearErrors,
  isUpdate,
  quantity,
  setQuantity,
  model,
  formValues,
  setFormValues,
  manualChange,
  setManualChange,
}) {
  const {
    members,
    aside: { setAside, isClosed, closeAside },
  } = useStore();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const amount = watch("price.amount");
  const currencyCode = watch("price.currencyCode") || "USD";

  const [selectedAssignedMember, setSelectedAssignedMember] =
    useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [assignedEmailOptions, setAssignedEmailOptions] = useState<string[]>(
    []
  );

  const { data: fetchedMembers = [], isLoading } = useFetchMembers();
  const selectedModel = watch("model");

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [missingMemberData, setMissingMemberData] = useState("");

  const [showNameInput, setShowNameInput] = useState(false);
  const [isRecoverable, setIsRecoverable] = useState(false);
  const [member, setMember] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const isAsideClosed = useRef(false);

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
    if (isUpdate && !manualChange) {
      const assignedMember = formState.assignedMember as string;
      const assignedEmail = formState.assignedEmail as string;

      // console.log("Initial assignedMember:", assignedMember);
      // console.log("Initial assignedEmail:", assignedEmail);

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

      // console.log("Selected assignedMember after set:", selectedAssignedMember);
    }
  }, [isUpdate, fetchedMembers, formState, setValue, setAssignedEmail]);

  const handleInputChange = (name: keyof FieldValues, value: string) => {
    setValue(name, value);
    clearErrors(name);
  };

  const revalidateSelectedMember = () => {
    if (!selectedAssignedMember) return;

    const updatedMember = members.members.find(
      (member) =>
        `${member.firstName} ${member.lastName}` === selectedAssignedMember
    );

    if (updatedMember) {
      const missingFields = getMissingFields(updatedMember);
      if (missingFields.length > 0) {
        setMissingMemberData(
          missingFields.reduce((acc, field, index) => {
            if (index === 0) {
              return capitalizeAndSeparateCamelCase(field);
            }
            return acc + " - " + capitalizeAndSeparateCamelCase(field);
          }, "")
        );
        setShowErrorDialog(true);
      } else {
        const email = updatedMember.email || "";
        setAssignedEmail(email);
        setValue("assignedEmail", email, { shouldValidate: true });
        setValue("assignedMember", selectedAssignedMember, {
          shouldValidate: true,
        });
      }
    }
  };

  // Detecta el cierre del aside y revalida el miembro seleccionado
  useEffect(() => {
    if (isAsideClosed.current) {
      // console.log("Revalidando miembro seleccionado al cerrar el aside...");
      revalidateSelectedMember();
      isAsideClosed.current = false; // Resetea la referencia
    }
  }, [isClosed]);

  // Manejo del cierre del aside (usado en el botón de 'Save' y en la 'X' de cierre)
  const handleCloseAside = () => {
    setAside(undefined);
    closeAside();
    isAsideClosed.current = true;
  };

  const handleSaveClick = async () => {
    if (!selectedAssignedMember) {
      console.error("No se ha seleccionado un miembro asignado.");
      setValidationError("Assigned Member es requerido");
      setAside("EditMember");
      return;
    }
    handleCloseAside();
  };

  const handleAssignedMemberChange = (selectedFullName: string) => {
    // console.log("Selected FullName:", selectedFullName);

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
      // console.log("Selected Member:", selectedMember);

      if (selectedAssignedMember !== "None" && selectedAssignedMember !== "") {
        const preSelectedMember = members.members.find(
          (member) =>
            `${member.firstName} ${member.lastName}` === selectedAssignedMember
        );

        const missingFields = getMissingFields(preSelectedMember);
        if (getMissingFields(preSelectedMember).length) {
          setMember(preSelectedMember._id);
          setMissingMemberData(
            missingFields.reduce((acc, field, index) => {
              if (index === 0) {
                return capitalizeAndSeparateCamelCase(field);
              }
              return acc + " - " + capitalizeAndSeparateCamelCase(field);
            }, "")
          );

          setShowErrorDialog(true);
          return;
        }
      }

      // TODO: ACA esta la persona anterior al cambio osea que si es diferente de None tengo que validar que los datos esten para el canal de slack
      // console.log(selectedAssignedMember);

      const missingFields = getMissingFields(selectedMember);
      if (getMissingFields(selectedMember).length) {
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
        return;
      }

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

  useEffect(() => {
    if (quantity > 1) {
      setValue("assignedMember", "");
      setValue("assignedEmail", "");
      setSelectedAssignedMember("");
      setValue("location", "");
      setSelectedLocation("");
      clearErrors(["assignedEmail", "assignedMember", "location"]);
    }
  }, [quantity, clearErrors, setValue]);

  useEffect(() => {
    if (selectedModel === "Other") {
      setShowNameInput(true);
    } else {
      setShowNameInput(false);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (selectedModel === "Other") {
      setValue("name", watch("name") || "");
    }
  }, [selectedModel, setValue, watch]);

  const handleRecoverableChange = (value: boolean) => {
    setIsRecoverable(value);
    setValue("recoverable", value);
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col gap-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="flex-grow w-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <GenericAlertDialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Please complete the missing data: "
        description={missingMemberData}
        buttonText="Update Member"
        onButtonClick={() => {
          members.setMemberToEdit(member);
          setAside("EditMember");
          setShowErrorDialog(false);
        }}
      />
      {isUpdate ? (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
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
                <p className="text-red-500">
                  {(errors.category as any).message}
                </p>
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
              searchable={true}
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
            <LocationField
              selectedAssignedMember={selectedAssignedMember}
              selectedLocation={selectedLocation as Location}
              onLocationChange={(location) => {
                setSelectedLocation(location);
                setValue("location", location);
              }}
              isLocationEnabled={isLocationEnabled || isUpdate || quantity > 1}
              error={(errors.location as any)?.message}
              clearErrors={clearErrors}
            />
          </div>
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
          <div className="w-full ">
            <InputProductForm
              placeholder="Serial Number"
              title="Serial Number"
              type="text"
              value={watch("serialNumber") as string}
              name="serialNumber"
              onChange={(e) =>
                handleInputChange("serialNumber", e.target.value)
              }
              className="w-full"
              disabled={quantity > 1 && !isUpdate}
            />
          </div>
          <div className="w-full mt-3">
            <PriceInput
              currencyCode={currencyCode}
              amount={amount}
              onCurrencyChange={(currency) =>
                setValue("price.currencyCode", currency)
              }
              onAmountChange={(value) => setValue("price.amount", value)}
              disabled={false}
              isUpdate={isUpdate}
              formValues={formValues}
            />
          </div>
          <div className="w-full col-span-2 mt-4">
            <RecoverableSwitch
              selectedCategory={selectedCategory}
              onRecoverableChange={handleRecoverableChange}
              isUpdate={isUpdate}
              formValues={formValues}
              setFormValues={setFormValues}
              setManualChange={setManualChange}
              manualChange={manualChange}
            />
          </div>

          {selectedModel === "Other" ||
          (isUpdate && watch("name") && selectedModel === "Other") ? (
            <div className="w-full">
              <InputProductForm
                placeholder="Product Name"
                title="Product Name*"
                type="text"
                value={watch("name") as string}
                name="name"
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              <div className="min-h-[24px]">
                {errors.name && (
                  <p className="text-red-500">{(errors.name as any).message}</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 items-start ">
            <div>
              <DropdownInputProductForm
                options={CATEGORIES}
                placeholder="Category"
                title="Category*"
                name="category"
                selectedOption={watch("category")}
                onChange={(category: Category) => {
                  handleCategoryChange(category);
                  clearErrors("category");
                }}
                required="required"
              />
              <div className="min-h-[24px]">
                {errors.category && (
                  <p className="text-red-500">
                    {(errors.category as any).message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <QuantityCounter quantity={quantity} setQuantity={setQuantity} />
              <RecoverableSwitch
                selectedCategory={selectedCategory}
                onRecoverableChange={handleRecoverableChange}
                formValues={formValues}
                setFormValues={setFormValues}
                setManualChange={setManualChange}
                manualChange={manualChange}
              />
            </div>

            <div className="mt-3">
              <PriceInput
                currencyCode={watch("price.currencyCode") || "USD"}
                amount={amount !== undefined ? amount : undefined}
                onCurrencyChange={(currency) =>
                  setValue("price.currencyCode", currency)
                }
                onAmountChange={(value) => setValue("price.amount", value)}
                disabled={false}
                isUpdate={isUpdate}
              />
            </div>

            {selectedModel === "Other" ? (
              <div>
                <InputProductForm
                  placeholder="Product Name"
                  title="Product Name*"
                  type="text"
                  value={watch("name") as string}
                  name="name"
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                <div className="min-h-[24px]">
                  {errors.name && (
                    <p className="text-red-500">
                      {(errors.name as any).message}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-4 mt-4">
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
                disabled={quantity > 1}
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
              <LocationField
                selectedAssignedMember={selectedAssignedMember}
                selectedLocation={selectedLocation as Location}
                onLocationChange={(location) => {
                  setSelectedLocation(location);
                  setValue("location", location);
                }}
                isLocationEnabled={isUpdate || quantity <= 1}
                error={(errors.location as any)?.message}
                clearErrors={clearErrors}
              />
            </div>
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
                onChange={(e) =>
                  handleInputChange("serialNumber", e.target.value)
                }
                className="w-full"
                disabled={quantity > 1 && !isUpdate}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default observer(CategoryForm);

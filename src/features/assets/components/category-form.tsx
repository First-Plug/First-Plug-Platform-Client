"use client";
import React, { useState, useEffect, useRef } from "react";

import { Category, Location } from "@/features/assets";
import { CATEGORIES } from "@/features/assets/interfaces/product";

import { FieldValues, useFormContext } from "react-hook-form";
import { Skeleton } from "@/shared";
import {
  QuantityCounter,
  RecoverableSwitch,
  PriceInput,
  ProductCondition,
  AdditionalInfo,
  DropdownInputProductForm,
  InputProductForm,
} from "@/features/assets";
import { useFetchMembers } from "@/features/members";

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

export const CategoryForm = ({
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
}: CategoryFormProps) => {
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

  const [showNameInput, setShowNameInput] = useState(false);
  const [isRecoverable, setIsRecoverable] = useState(false);

  useEffect(() => {
    if (fetchedMembers) {
      const memberFullNames = [
        "None",
        ...fetchedMembers.map(
          (member) => `${member.firstName} ${member.lastName}`
        ),
      ];
      setAssignedEmailOptions(memberFullNames);
    }
  }, [fetchedMembers]);

  useEffect(() => {
    if (isUpdate && !manualChange) {
      const assignedMember = formState.assignedMember as string;
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
      setValue("productCondition", formState.productCondition || "Optimal");
    }
  }, [isUpdate, fetchedMembers, formState, setValue, setAssignedEmail]);

  const handleInputChange = (name: keyof FieldValues, value: string) => {
    setValue(name, value);
    clearErrors(name);
  };

  const prevCategoryRef = useRef<Category | "">(selectedCategory);

  useEffect(() => {
    if (!isUpdate && prevCategoryRef.current !== selectedCategory) {
      // Solo resetea si la categoría realmente cambió
      setSelectedAssignedMember("");
      setAssignedEmail("");
      setValue("assignedEmail", "");
      setValue("assignedMember", "");
      setSelectedLocation("");
      setValue("location", "");
      clearErrors(["assignedEmail", "assignedMember", "location"]);

      // Actualiza la referencia
      prevCategoryRef.current = selectedCategory;
    }
  }, [selectedCategory, isUpdate, setValue, setAssignedEmail, clearErrors]);

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
      const selectedMember = fetchedMembers.find(
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

  useEffect(() => {
    if (quantity > 1) {
      setValue("assignedMember", "");
      setValue("assignedEmail", "");
      setSelectedAssignedMember("");
      setValue("location", "");
      setSelectedLocation("");
      setValue("productCondition", "Optimal");
      setValue("additionalInfo", "");
      clearErrors([
        "assignedEmail",
        "assignedMember",
        "location",
        "productCondition",
        "additionalInfo",
      ]);
    }
  }, [quantity, clearErrors, setValue]);

  useEffect(() => {
    if (selectedModel === "Other") {
      setValue("name", watch("name") || "");
    }
  }, [selectedModel, setValue, watch]);

  const handleRecoverableChange = (value: boolean) => {
    setIsRecoverable(value);
    setValue("recoverable", value);
  };

  const shouldShowProductNameInput = () => {
    const attributes = watch("attributes") || [];
    const selectedModel =
      watch("model") || attributes.find((attr) => attr?.key === "model")?.value;

    if (selectedCategory === "Merchandising") {
      return true;
    }
    if (selectedModel === "Other") {
      return true;
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 w-full h-full">
        <Skeleton className="w-full h-12" />
        <Skeleton className="flex-grow w-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {isUpdate ? (
        <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
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
              disabled={true}
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
                  disabled={true}
                />
                <div className="min-h-[24px]">
                  {errors.location && (
                    <p className="text-red-500">
                      {(errors.location as any).message ===
                      "Invalid enum value. Expected 'Our office' | 'FP warehouse' | 'Employee', received ''"
                        ? "Location is required"
                        : (errors.location as any).message}
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
                disabled={true}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full"
                readOnly={selectedLocation === "Employee"}
              />
            )}
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
          <div className="mt-3 w-full">
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

          <div>
            <ProductCondition
              isUpdate={isUpdate}
              isDisabled={false}
              selectedOption={watch("productCondition")}
            />
          </div>

          {shouldShowProductNameInput() && (
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
                  <p className="text-red-500">{(errors.name as any).message}</p>
                )}
              </div>
            </div>
          )}
          <div className="lg:col-span-2">
            <div className="items-start gap-4 grid grid-cols-5">
              <div className="col-span-1">
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
              <div className="col-span-4">
                <AdditionalInfo isUpdate={isUpdate} initialData={formValues} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="items-start gap-4 grid grid-cols-4">
            <div>
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

            {shouldShowProductNameInput() ? (
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

          <div className="gap-4 grid grid-cols-1 lg:grid-cols-4 mt-4">
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
                disabled={!selectedCategory || quantity > 1}
              />
              <div className="min-h-[24px]">
                {errors.assignedEmail && (
                  <p className="bg-green text-red-500">
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
                    options={["Our office"]}
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
                    disabled={!isLocationEnabled || quantity > 1}
                  />
                  <div className="min-h-[24px]">
                    {errors.location && (
                      <p className="text-red-500">
                        {(errors.location as any).message ===
                        "Invalid enum value. Expected 'Our office' | 'FP warehouse' | 'Employee', received ''"
                          ? "Location is required"
                          : (errors.location as any).message}
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
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className="w-full"
                  readOnly={selectedLocation === "Employee"}
                />
              )}
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
          <div className="items-start gap-4 grid grid-cols-4 mt-2">
            <div className="col-span-1">
              <ProductCondition
                isUpdate={isUpdate}
                isDisabled={quantity > 1}
                selectedOption={watch("productCondition")}
              />
            </div>

            <div className="col-span-3">
              <AdditionalInfo
                isUpdate={isUpdate}
                initialData={formValues}
                disabled={quantity > 1}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

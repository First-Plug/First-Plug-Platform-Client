"use client";
import React, { useState, useEffect, useRef } from "react";

import { Category, Location } from "@/features/assets";
import { CATEGORIES } from "@/features/assets/interfaces/product";

import { FieldValues, useFormContext } from "react-hook-form";
import { Skeleton, CountryFlag } from "@/shared";
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
import { useOffices } from "@/features/settings";
import SelectDropdownOptions from "@/shared/components/select-dropdown-options";
import { countriesByCode } from "@/shared/constants/country-codes";

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
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [assignedEmailOptions, setAssignedEmailOptions] = useState<string[]>(
    []
  );
  const [locationOptionGroups, setLocationOptionGroups] = useState<
    Array<{
      label: string;
      options: Array<string | { display: React.ReactNode; value: string }>;
    }>
  >([]);

  const { data: fetchedMembers = [], isLoading } = useFetchMembers();
  const { offices, isLoading: isLoadingOffices } = useOffices();
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
    if (offices && offices.length > 0) {
      // Ordenar oficinas para que la por defecto aparezca primero
      const sortedOffices = [...offices].sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });

      // Crear grupos de opciones para el dropdown con banderas
      const groups = [
        {
          label: "Our offices",
          options: sortedOffices.map((office) => {
            const countryName = office.country
              ? countriesByCode[office.country] || office.country
              : "";
            const displayLabel = `${countryName} - ${office.name}`;

            return {
              display: (
                <>
                  {office.country && (
                    <CountryFlag
                      countryName={office.country}
                      size={16}
                      className="rounded-sm"
                    />
                  )}
                  <span className="truncate">{displayLabel}</span>
                </>
              ),
              value: displayLabel,
            };
          }),
        },
      ];
      setLocationOptionGroups(groups);
    }
  }, [offices]);

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
  }, [
    isUpdate,
    fetchedMembers,
    formState,
    setValue,
    setAssignedEmail,
    manualChange,
  ]);

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

  const handleLocationChange = (displayValue: string) => {
    setSelectedLocation(displayValue);
    setValue("location", "Our office"); // Siempre enviar "Our office" cuando se selecciona una oficina
    clearErrors("location");

    // Buscar la oficina seleccionada por el formato "country - name" y obtener su ID
    const selectedOffice = offices?.find((office) => {
      const countryName = office.country
        ? countriesByCode[office.country] || office.country
        : "";
      return `${countryName} - ${office.name}` === displayValue;
    });

    if (selectedOffice) {
      setSelectedOfficeId(selectedOffice._id);
      setValue("officeId", selectedOffice._id);
    } else {
      setSelectedOfficeId(null);
      setValue("officeId", undefined);
    }
  };

  const handleAssignedMemberChange = (selectedFullName: string) => {
    setSelectedAssignedMember(selectedFullName);

    if (selectedFullName === "None" || selectedFullName === "") {
      setAssignedEmail("");
      setValue("assignedEmail", "");
      setValue("assignedMember", "");
      setSelectedLocation(undefined);
      setValue("location", undefined);
      setSelectedOfficeId(null);
      setValue("officeId", undefined);
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
      setSelectedOfficeId(null);
      setValue("officeId", undefined);
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
      setSelectedOfficeId(null);
      setValue("officeId", undefined);
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

  if (isLoading || isLoadingOffices) {
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
                <SelectDropdownOptions
                  label="Location*"
                  placeholder="Location"
                  value={selectedLocation || ""}
                  onChange={handleLocationChange}
                  optionGroups={locationOptionGroups}
                  className="w-full"
                  disabled={true}
                  required
                  productFormStyle={true}
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
                  <SelectDropdownOptions
                    label="Location*"
                    placeholder="Location"
                    value={selectedLocation || ""}
                    onChange={handleLocationChange}
                    optionGroups={locationOptionGroups}
                    className="w-full"
                    disabled={!isLocationEnabled || quantity > 1}
                    required
                    productFormStyle={true}
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

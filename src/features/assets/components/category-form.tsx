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
import { useOffices, useOfficeStore } from "@/features/settings";
import SelectDropdownOptions from "@/shared/components/select-dropdown-options";
import { countriesByCode } from "@/shared/constants/country-codes";
import { useAsideStore } from "@/shared";

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
  const { pushAside } = useAsideStore();
  const { newlyCreatedOffice, clearNewlyCreatedOffice } = useOfficeStore();
  const ADD_OFFICE_VALUE = "__ADD_OFFICE__";
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
    // Ordenar oficinas para que la por defecto aparezca primero
    const sortedOffices = offices
      ? [...offices].sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return 0;
        })
      : [];

    // Obtener countryCode del producto si está disponible
    const productCountryCode = formState?.countryCode as string | undefined;

    // Crear grupos de opciones para el dropdown con banderas
    const groups = [
      {
        label: "Our offices",
        options: [
          ...(sortedOffices && sortedOffices.length > 0
            ? sortedOffices.map((office) => {
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
              })
            : []),
          {
            display: (
              <span className="font-medium text-blue">+ Add Office</span>
            ),
            value: ADD_OFFICE_VALUE,
          },
          // Agregar "FP warehouse" como opción válida solo en modo update
          ...(isUpdate
            ? [
                {
                  display: productCountryCode ? (
                    <>
                      <CountryFlag
                        countryName={productCountryCode}
                        size={16}
                        className="rounded-sm"
                      />
                      <span className="truncate">
                        {countriesByCode[productCountryCode.toUpperCase()] ||
                          productCountryCode}{" "}
                        - FP warehouse
                      </span>
                    </>
                  ) : (
                    <span className="truncate">FP warehouse</span>
                  ),
                  value: "FP warehouse",
                },
              ]
            : []),
        ],
      },
    ];
    setLocationOptionGroups(groups);
  }, [offices, isUpdate, formState?.countryCode]);

  // Detectar cuando se crea una nueva oficina
  useEffect(() => {
    if (newlyCreatedOffice) {
      // Seleccionar automáticamente la nueva oficina
      const countryName = newlyCreatedOffice.country
        ? countriesByCode[newlyCreatedOffice.country] ||
          newlyCreatedOffice.country
        : "";
      const displayLabel = `${countryName} - ${newlyCreatedOffice.name}`;

      setSelectedLocation(displayLabel);
      setValue("location", "Our office");
      setSelectedOfficeId(newlyCreatedOffice._id);
      setValue("officeId", newlyCreatedOffice._id);
      clearErrors("location");

      // Limpiar la oficina recién creada después de usarla
      clearNewlyCreatedOffice();
    }
  }, [newlyCreatedOffice, setValue, clearErrors, clearNewlyCreatedOffice]);

  useEffect(() => {
    if (isUpdate && !manualChange && offices && offices.length > 0) {
      const assignedMember = formState.assignedMember as string;
      const assignedEmail = formState.assignedEmail as string;
      const location = formState.location as string;

      const selectedMember = fetchedMembers.find(
        (member) => `${member.firstName} ${member.lastName}` === assignedMember
      );

      setSelectedAssignedMember(
        selectedMember ? assignedMember : assignedEmail || "None"
      );
      setValue("assignedMember", assignedMember || "");
      setAssignedEmail(selectedMember?.email || assignedEmail || "");

      // Transformar location al formato correcto para el dropdown
      let locationToDisplay = location;

      // Normalizar "FP Warehouse" a "FP warehouse" si viene con mayúscula
      if (location === "FP Warehouse") {
        locationToDisplay = "FP warehouse";
      }

      // Si es FP warehouse y tiene countryCode, agregar el país al display
      if (locationToDisplay === "FP warehouse") {
        const productCountryCode = formState?.countryCode as string | undefined;
        if (productCountryCode) {
          const countryName =
            countriesByCode[productCountryCode.toUpperCase()] ||
            productCountryCode;
          locationToDisplay = `${countryName} - FP warehouse`;
        }
      } else if (
        locationToDisplay &&
        locationToDisplay !== "Employee" &&
        locationToDisplay !== "FP warehouse"
      ) {
        // Primero intentar buscar por officeName si está disponible
        let office = formState.officeName
          ? offices?.find((o) => o.name === formState.officeName)
          : null;

        // Si no se encontró, buscar por location
        if (!office) {
          office = offices?.find((office) => office.name === location);
        }

        if (office) {
          const countryName = office.country
            ? countriesByCode[office.country] || office.country
            : "";
          locationToDisplay = `${countryName} - ${office.name}`;
          setSelectedOfficeId(office._id);
          setValue("officeId", office._id);
        } else {
          // Si no se encuentra la oficina, usar location tal cual
          locationToDisplay = location;
        }
      }

      // Para FP warehouse, el value debe ser solo "FP warehouse" para que coincida con las opciones
      const finalLocationValue =
        location === "FP Warehouse" || location === "FP warehouse"
          ? "FP warehouse"
          : locationToDisplay;

      setSelectedLocation(finalLocationValue);
      // Guardar el valor normalizado (FP warehouse con w minúscula)
      const normalizedLocation =
        location === "FP Warehouse" ? "FP warehouse" : location;
      setValue("location", normalizedLocation);
      setValue("productCondition", formState.productCondition || "Optimal");
    }
  }, [
    isUpdate,
    fetchedMembers,
    formState,
    setValue,
    setAssignedEmail,
    manualChange,
    offices,
    locationOptionGroups,
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
      setValue("location", undefined);
      clearErrors(["assignedEmail", "assignedMember", "location"]);

      // Actualiza la referencia
      prevCategoryRef.current = selectedCategory;
    }
  }, [selectedCategory, isUpdate, setValue, setAssignedEmail, clearErrors]);

  const handleLocationChange = (displayValue: string) => {
    if (displayValue === ADD_OFFICE_VALUE) {
      pushAside("CreateOffice");
      return;
    }
    setSelectedLocation(displayValue);
    clearErrors("location");

    // Si es "FP warehouse" (con o sin país), establecer la location directamente
    if (
      displayValue === "FP warehouse" ||
      displayValue.includes(" - FP warehouse")
    ) {
      setValue("location", "FP warehouse");
      setSelectedOfficeId(null);
      setValue("officeId", undefined);
      return;
    }

    setValue("location", "Our office"); // Siempre enviar "Our office" cuando se selecciona una oficina

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
      setValue("location", undefined);
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
                  searchable
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
                    searchable
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

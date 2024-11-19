"use client";
import React, { useState, useEffect } from "react";
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
import PriceInput from "./PriceInput";
import LocationField from "./LocationField";
import AssignedMemberField from "./AssignedMemberField";
import { useRouter } from "next/navigation";
import { formatMissingFieldsMessage, validateBillingInfo } from "@/lib/utils";
import { useSession } from "next-auth/react";

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
  selectedAssignedMember: string;
  setSelectedAssignedMember: React.Dispatch<React.SetStateAction<string>>;
  selectedLocation: string;
  setSelectedLocation: React.Dispatch<React.SetStateAction<string>>;
  missingDataType: "member" | "billing";
  setMissingDataType: React.Dispatch<
    React.SetStateAction<"member" | "billing">
  >;
  onLocationChange: (location: string) => void;
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
  selectedAssignedMember,
  setSelectedAssignedMember,
  selectedLocation,
  setSelectedLocation,
  missingDataType,
  setMissingDataType,
  onLocationChange,
}) {
  const {
    members,
    aside: { setAside },
  } = useStore();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const { data: fetchedMembers = [], isLoading } = useFetchMembers();
  const router = useRouter();
  const session = useSession();
  const user = session.data?.user;

  const amount = watch("price.amount");
  const currencyCode = watch("price.currencyCode") || "USD";
  const selectedModel = watch("model");
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [missingMemberData, setMissingMemberData] = useState("");
  const [member, setMember] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [isRecoverable, setIsRecoverable] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleInputChange = (name: keyof FieldValues, value: string) => {
    setValue(name, value);
    clearErrors(name);
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

  const handleShowErrorDialog = (
    missingData: string,
    type: "member" | "billing"
  ) => {
    console.log("Tipo de datos faltantes:", type);
    setShowErrorDialog(true);
    setMissingMemberData(missingData);
    setMissingDataType(type);
  };

  const showMemberErrorDialog = (missingData: string) => {
    handleShowErrorDialog(missingData, "member");
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
        buttonText={
          missingDataType === "member" ? "Update Member" : "Go to Settings"
        }
        onButtonClick={() => {
          if (missingDataType === "member") {
            members.setMemberToEdit(member);
            setAside("EditMember");
          } else {
            setAside(undefined);
            router.push("/home/settings");
          }
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
            <AssignedMemberField
              fetchedMembers={fetchedMembers}
              setAssignedEmail={setAssignedEmail}
              setSelectedLocation={setSelectedLocation}
              setIsLocationEnabled={setIsLocationEnabled}
              setMissingMemberData={setMissingMemberData}
              setShowErrorDialog={setShowErrorDialog}
              setMissingDataType={setMissingDataType}
              setMember={setMember}
              isUpdate={isUpdate}
              clearErrors={clearErrors}
              isDisabled={quantity > 1}
              showErrorDialog={showMemberErrorDialog}
              formState={formState}
              manualChange={manualChange}
              selectedAssignedMember={selectedAssignedMember}
              setSelectedAssignedMember={setSelectedAssignedMember}
              initialSelectedMember={
                isUpdate ? (formState.assignedMember as string) : "None"
              }
            />
          </div>

          <div className="w-full">
            <LocationField
              selectedAssignedMember={selectedAssignedMember}
              selectedLocation={selectedLocation as Location}
              onLocationChange={onLocationChange}
              isLocationEnabled={isLocationEnabled || isUpdate || quantity > 1}
              error={(errors.location as any)?.message}
              clearErrors={clearErrors}
              user={user}
              setShowErrorDialog={setShowErrorDialog}
              setMissingMemberData={setMissingMemberData}
              setMissingDataType={setMissingDataType}
              isUpdate={isUpdate}
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
              <AssignedMemberField
                fetchedMembers={fetchedMembers}
                setAssignedEmail={setAssignedEmail}
                setSelectedLocation={setSelectedLocation}
                setIsLocationEnabled={setIsLocationEnabled}
                setMissingMemberData={setMissingMemberData}
                setShowErrorDialog={setShowErrorDialog}
                setMember={setMember}
                isUpdate={isUpdate}
                clearErrors={clearErrors}
                isDisabled={quantity > 1}
                formState={formState}
                manualChange={manualChange}
                showErrorDialog={showMemberErrorDialog}
                initialSelectedMember=""
                selectedAssignedMember={selectedAssignedMember}
                setSelectedAssignedMember={setSelectedAssignedMember}
                setMissingDataType={setMissingDataType}
              />
            </div>
            <div className="w-full">
              <LocationField
                selectedAssignedMember={selectedAssignedMember}
                selectedLocation={selectedLocation as Location}
                onLocationChange={setSelectedLocation}
                isLocationEnabled={isUpdate || quantity <= 1}
                error={(errors.location as any)?.message}
                clearErrors={clearErrors}
                user={user}
                setShowErrorDialog={setShowErrorDialog}
                setMissingMemberData={setMissingMemberData}
                setMissingDataType={setMissingDataType}
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

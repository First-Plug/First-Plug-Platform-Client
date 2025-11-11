"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAsideStore, Button } from "@/shared";
import { ArrowLeft } from "lucide-react";
import { Tenant, useUpdateTenantOffice } from "@/features/tenants";
import { useQueryClient } from "@tanstack/react-query";
import { Office } from "@/features/settings/types/settings.types";
import { useOffices } from "@/features/settings/hooks/use-offices";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/shared";
import { DropdownInputProductForm } from "@/features/assets";
import { countriesByCode } from "@/shared/constants/country-codes";
import { useMemo } from "react";

const phoneRegex = /^\+?[0-9\s]*$/;
const onlyLetters = /^[A-Za-z\s\u00C0-\u00FF]*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const updateOfficeSchema = z.object({
  name: z.string().min(1, "Office name is required"),

  email: z
    .string()
    .refine((value) => value === "" || emailRegex.test(value), {
      message: "Please enter a valid email address",
    })
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .refine((value) => value === "" || phoneRegex.test(value), {
      message:
        "Phone number is invalid. Use only numbers, spaces, and optional + at the start",
    })
    .optional()
    .or(z.literal("")),

  country: z.string().optional().or(z.literal("")),

  state: z
    .string()
    .refine((value) => value === "" || onlyLetters.test(value), {
      message: "State can only contain letters",
    })
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .refine((value) => value === "" || onlyLetters.test(value), {
      message: "City can only contain letters",
    })
    .optional()
    .or(z.literal("")),

  zipCode: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  apartment: z.string().optional().or(z.literal("")),
  additionalInfo: z.string().optional().or(z.literal("")),
});

type UpdateOfficeFormData = z.infer<typeof updateOfficeSchema>;

// Campos requeridos para shipments
const REQUIRED_FOR_SHIPMENTS = [
  "name",
  "phone",
  "country",
  "state",
  "city",
  "zipCode",
  "address",
];

// Warning icon for required shipment fields
const ShipmentRequiredBadge = () => (
  <svg
    className="w-4 h-4 text-yellow-600"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

export const UpdateOffice = () => {
  const countryOptions = Object.entries(countriesByCode).map(
    ([code, name]) => ({
      code,
      name,
    })
  );
  const { setAside, popAside, stack } = useAsideStore();
  const queryClient = useQueryClient();
  const selectedTenant = queryClient.getQueryData<Tenant>(["selectedTenant"]);
  const selectedOffice = queryClient.getQueryData<Office>(["selectedOffice"]);
  const updateOfficeMutation = useUpdateTenantOffice();
  const { updateOffice } = useOffices();

  const methods = useForm<UpdateOfficeFormData>({
    resolver: zodResolver(updateOfficeSchema),
    defaultValues: {
      name: selectedOffice?.name || selectedTenant?.office?.name || "",
      email: selectedOffice?.email || selectedTenant?.office?.email || "",
      phone: selectedOffice?.phone || selectedTenant?.office?.phone || "",
      country: selectedOffice?.country || selectedTenant?.office?.country || "",
      state: selectedOffice?.state || selectedTenant?.office?.state || "",
      city: selectedOffice?.city || selectedTenant?.office?.city || "",
      zipCode: selectedOffice?.zipCode || selectedTenant?.office?.zipCode || "",
      address: selectedOffice?.address || selectedTenant?.office?.address || "",
      apartment:
        selectedOffice?.apartment || selectedTenant?.office?.apartment || "",
      additionalInfo:
        selectedOffice?.additionalInfo ||
        selectedTenant?.office?.additionalInfo ||
        "",
    },
  });

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  // Watch all form values to make the warning reactive
  const formValues = useWatch({ control: methods.control });

  // Helper para verificar si un campo es requerido para shipments
  const isRequiredForShipment = (fieldName: string) => {
    return REQUIRED_FOR_SHIPMENTS.includes(fieldName);
  };

  // Verificar si un campo específico está incompleto
  const isFieldIncomplete = (fieldName: string) => {
    const value = formValues[fieldName as keyof UpdateOfficeFormData];
    return !value || (typeof value === "string" && value.trim() === "");
  };

  // Verificar si faltan datos necesarios para shipments
  const missingFields = useMemo(() => {
    const missing: string[] = [];

    REQUIRED_FOR_SHIPMENTS.forEach((field) => {
      const value = formValues[field as keyof UpdateOfficeFormData];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        missing.push(field);
      }
    });

    return missing;
  }, [formValues]);

  const hasMissingData = missingFields.length > 0;

  const isSaveButtonEnabled = () => {
    if (isSubmitting) return false;
    return isDirty;
  };

  const onSubmit = async (data: UpdateOfficeFormData) => {
    if (!selectedTenant && !selectedOffice) {
      return;
    }

    const originalData = {
      name: selectedOffice?.name || selectedTenant?.office?.name || "",
      email: selectedOffice?.email || selectedTenant?.office?.email || "",
      phone: selectedOffice?.phone || selectedTenant?.office?.phone || "",
      country: selectedOffice?.country || selectedTenant?.office?.country || "",
      state: selectedOffice?.state || selectedTenant?.office?.state || "",
      city: selectedOffice?.city || selectedTenant?.office?.city || "",
      zipCode: selectedOffice?.zipCode || selectedTenant?.office?.zipCode || "",
      address: selectedOffice?.address || selectedTenant?.office?.address || "",
      apartment:
        selectedOffice?.apartment || selectedTenant?.office?.apartment || "",
    };

    const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
      const originalValue = originalData[key as keyof typeof originalData];
      if (value !== originalValue) {
        acc[key as keyof UpdateOfficeFormData] = value || "";
      }
      return acc;
    }, {} as Partial<UpdateOfficeFormData>);

    if (Object.keys(filteredData).length === 0) {
      setAside(null);
      return;
    }

    if (
      filteredData.name !== undefined &&
      (!filteredData.name || filteredData.name.trim() === "")
    ) {
      return;
    }

    try {
      if (selectedTenant) {
        await updateOfficeMutation.mutateAsync({
          tenantId: selectedTenant.id,
          data: filteredData,
        });
      } else if (selectedOffice) {
        await updateOffice(selectedOffice._id, filteredData);
      }
      setAside(null);
    } catch (error: any) {}
  };

  const handleGoBack = () => {
    if (stack.length > 1) {
      popAside();
    } else {
      setAside(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mt-2">
        {stack.length > 1 && (
          <Button
            onClick={handleGoBack}
            variant="secondary"
            size="small"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pr-4">
            {/* Warning para datos incompletos */}
            {hasMissingData && (
              <div className="flex items-start gap-3 bg-yellow-50 mt-6 p-4 border border-yellow-200 rounded-lg">
                <svg
                  className="flex-shrink-0 mt-0.5 w-5 h-5 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-medium text-yellow-800 text-sm">
                    Incomplete Shipping Information
                  </h3>
                  <p className="mt-1 text-yellow-700 text-sm">
                    This office is missing required details to create or process
                    shipments.
                  </p>
                </div>
              </div>
            )}

            <div className="gap-4 grid grid-cols-2 mt-8">
              <FormField
                control={methods.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                      Office Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter office name"
                        {...field}
                        className="py-2 rounded-xl w-full h-14 text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contact email"
                        type="email"
                        {...field}
                        className="py-2 rounded-xl w-full h-14 text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="gap-4 grid grid-cols-2">
              <FormField
                control={methods.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                      Contact Phone Number
                      {isRequiredForShipment("phone") &&
                        isFieldIncomplete("phone") && <ShipmentRequiredBadge />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+54 11 15466052"
                        {...field}
                        className="py-2 rounded-xl w-full h-14 text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                      Country
                      {isRequiredForShipment("country") &&
                        isFieldIncomplete("country") && (
                          <ShipmentRequiredBadge />
                        )}
                    </FormLabel>
                    <FormControl>
                      <DropdownInputProductForm
                        title=""
                        placeholder="Select Country"
                        options={countryOptions.map((option) => option.name)}
                        selectedOption={
                          field.value ? countriesByCode[field.value] : ""
                        }
                        onChange={(selectedCountryName) => {
                          const countryCode = Object.entries(
                            countriesByCode
                          ).find(
                            ([code, name]) => name === selectedCountryName
                          )?.[0];
                          field.onChange(countryCode || "");
                        }}
                        name="country"
                        searchable={true}
                        disabled={true}
                        className="-mb-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="gap-4 grid grid-cols-2">
              <FormField
                control={methods.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                      State
                      {isRequiredForShipment("state") &&
                        isFieldIncomplete("state") && <ShipmentRequiredBadge />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="State"
                        {...field}
                        className="py-2 rounded-xl w-full h-14 text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                      City
                      {isRequiredForShipment("city") &&
                        isFieldIncomplete("city") && <ShipmentRequiredBadge />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City"
                        {...field}
                        className="py-2 rounded-xl w-full h-14 text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="gap-4 grid grid-cols-2">
              <FormField
                control={methods.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                      Zip Code
                      {isRequiredForShipment("zipCode") &&
                        isFieldIncomplete("zipCode") && (
                          <ShipmentRequiredBadge />
                        )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Zip Code"
                        {...field}
                        className="py-2 rounded-xl w-full h-14 text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                      Address
                      {isRequiredForShipment("address") &&
                        isFieldIncomplete("address") && (
                          <ShipmentRequiredBadge />
                        )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Address"
                        {...field}
                        className="py-2 rounded-xl w-full h-14 text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quinta fila - Apartment (centrado) */}
            <div className="flex">
              <div className="w-1/2">
                <FormField
                  control={methods.control}
                  name="apartment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                        Apartment, Suite, etc.
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apartment, suite, etc."
                          {...field}
                          className="py-2 rounded-xl w-full h-14 text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Info - Full Width */}
            <div className="mt-6">
              <FormField
                control={methods.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                      Additional Info
                    </FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Enter any additional information about the office"
                        {...field}
                        className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-0 w-full min-h-[80px] placeholder:text-muted-foreground text-lg disabled:cursor-not-allowed"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </FormProvider>
      </div>

      <aside className="bottom-0 left-0 absolute bg-slate-50 py-2 border-t w-full">
        <div className="flex justify-end gap-2 mx-auto py-2 w-5/6">
          <Button
            variant="primary"
            className="px-8"
            onClick={handleSubmit(onSubmit)}
            disabled={!isSaveButtonEnabled()}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </aside>
    </div>
  );
};

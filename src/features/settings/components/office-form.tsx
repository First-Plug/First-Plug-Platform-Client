"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/shared";
import { DropdownInputProductForm } from "@/features/assets";
import { UseFormReturn, useWatch } from "react-hook-form";
import { OfficeFormData } from "../schemas/office.schema";
import { countriesByCode } from "@/shared/constants/country-codes";
import { z } from "zod";
import { useMemo } from "react";

interface OfficeFormProps {
  form: UseFormReturn<OfficeFormData>;
  isEditMode?: boolean;
}

// Campos requeridos para shipments (constante fuera del componente)
const REQUIRED_FOR_SHIPMENTS = [
  "name",
  "phone",
  "country",
  "state",
  "city",
  "zipCode",
  "address",
];

export const OfficeForm = ({ form, isEditMode = false }: OfficeFormProps) => {
  // Crear lista de países con código y nombre
  const COUNTRIES = Object.entries(countriesByCode).map(([code, name]) => ({
    code,
    name,
  }));

  // Watch all form values to make the warning reactive
  const formValues = useWatch({ control: form.control });

  // Helper para verificar si un campo es requerido para shipments
  const isRequiredForShipment = (fieldName: string) => {
    return REQUIRED_FOR_SHIPMENTS.includes(fieldName);
  };

  // Verificar si un campo específico está incompleto
  const isFieldIncomplete = (fieldName: string) => {
    const value = formValues[fieldName as keyof OfficeFormData];
    return !value || (typeof value === "string" && value.trim() === "");
  };

  // Verificar si faltan datos necesarios para shipments
  const missingFields = useMemo(() => {
    if (!isEditMode) return [];

    const missing: string[] = [];

    REQUIRED_FOR_SHIPMENTS.forEach((field) => {
      const value = formValues[field as keyof OfficeFormData];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        missing.push(field);
      }
    });

    return missing;
  }, [formValues, isEditMode]);

  const hasMissingData = missingFields.length > 0;

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="mb-2 font-semibold text-xl">Office Information</h2>
      <p className="mb-6 text-gray-600">
        Manage your office contact details and address information.
      </p>

      {/* Warning para datos incompletos en modo edición */}
      {isEditMode && hasMissingData && (
        <div className="flex items-start gap-3 bg-yellow-50 mb-6 p-4 border border-yellow-200 rounded-lg">
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
              Incomplete Data for Shipments
            </h3>
            <p className="mt-1 text-yellow-700 text-sm">
              This office is missing required information for shipments. Please
              complete the following fields:{" "}
              <span className="font-medium">
                {missingFields
                  .map((field) => {
                    // Formatear nombres de campos
                    const fieldLabels: Record<string, string> = {
                      name: "Office Name",
                      phone: "Office Phone",
                      country: "Country",
                      state: "State/Province",
                      city: "City",
                      zipCode: "Zip Code",
                      address: "Address",
                    };
                    return fieldLabels[field] || field;
                  })
                  .join(", ")}
              </span>
              .
            </p>
          </div>
        </div>
      )}

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                Office Name *
                {isEditMode &&
                  isRequiredForShipment("name") &&
                  isFieldIncomplete("name") && (
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
                  )}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter office name"
                  {...field}
                  className="rounded-xl h-14"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                Office Email
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="office@company.com"
                  {...field}
                  className="rounded-xl h-14"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                Office Phone
                {isEditMode &&
                  isRequiredForShipment("phone") &&
                  isFieldIncomplete("phone") && (
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
                  )}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="+1 234 567 8900"
                  {...field}
                  className="rounded-xl h-14"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <DropdownInputProductForm
                  title="Country *"
                  placeholder="Select a country"
                  options={COUNTRIES.map((country) => country.name)}
                  selectedOption={
                    field.value ? countriesByCode[field.value] : ""
                  }
                  onChange={(selectedCountryName) => {
                    const countryCode = Object.entries(countriesByCode).find(
                      ([code, name]) => name === selectedCountryName
                    )?.[0];
                    field.onChange(countryCode || "");
                  }}
                  name="country"
                  searchable={true}
                  required="required"
                  className="flex-1 -mb-2"
                />
                {isEditMode &&
                  isRequiredForShipment("country") &&
                  isFieldIncomplete("country") && (
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
                  )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                State/Province
                {isEditMode &&
                  isRequiredForShipment("state") &&
                  isFieldIncomplete("state") && (
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
                  )}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter state or province"
                  {...field}
                  className="rounded-xl h-14"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                City
                {isEditMode &&
                  isRequiredForShipment("city") &&
                  isFieldIncomplete("city") && (
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
                  )}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter city"
                  {...field}
                  className="rounded-xl h-14"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                Zip Code
                {isEditMode &&
                  isRequiredForShipment("zipCode") &&
                  isFieldIncomplete("zipCode") && (
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
                  )}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter zip code"
                  {...field}
                  className="rounded-xl h-14"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 ml-2 font-sans text-dark-grey text-sm">
                Address
                {isEditMode &&
                  isRequiredForShipment("address") &&
                  isFieldIncomplete("address") && (
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
                  )}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter office address"
                  {...field}
                  className="rounded-xl h-14"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apartment"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                Suite, Floor, etc.
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Suite, floor, unit, etc."
                  {...field}
                  className="rounded-xl h-14"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Additional Info - Full Width */}
      <div className="mt-6">
        <FormField
          control={form.control}
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
                  className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[80px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

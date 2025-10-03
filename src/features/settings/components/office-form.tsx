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
import { UseFormReturn } from "react-hook-form";
import { OfficeFormData } from "../schemas/office.schema";
import { countriesByCode } from "@/shared/constants/country-codes";
import { z } from "zod";

interface OfficeFormProps {
  form: UseFormReturn<OfficeFormData>;
  isEditMode?: boolean;
}

export const OfficeForm = ({ form, isEditMode = false }: OfficeFormProps) => {
  // Crear lista de países con código y nombre
  const COUNTRIES = Object.entries(countriesByCode).map(([code, name]) => ({
    code,
    name,
  }));
  return (
    <div className="p-6 border rounded-lg">
      <h2 className="mb-2 font-semibold text-xl">Office Information</h2>
      <p className="mb-6 text-gray-600">
        Manage your office contact details and address information.
      </p>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                Office Name *
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
              <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                Office Phone
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
              <DropdownInputProductForm
                title="Country"
                placeholder="Select a country"
                options={COUNTRIES.map((country) => country.name)}
                selectedOption={field.value ? countriesByCode[field.value] : ""}
                onChange={(selectedCountryName) => {
                  const countryCode = Object.entries(countriesByCode).find(
                    ([code, name]) => name === selectedCountryName
                  )?.[0];
                  field.onChange(countryCode || "");
                }}
                name="country"
                searchable={true}
                required={!isEditMode ? "required" : undefined}
                disabled={isEditMode}
                className="-mb-2"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                State/Province
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
              <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                City
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
              <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                Zip Code
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
              <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                Address
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

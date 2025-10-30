"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAsideStore, Button } from "@/shared";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useOffices } from "@/features/settings/hooks/use-offices";
import { CreateOffice as CreateOfficeType } from "@/features/settings/types/settings.types";
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
import {
  createOfficeSchema,
  type OfficeFormData,
} from "@/features/settings/schemas/office.schema";

export const CreateOffice = () => {
  const countryOptions = Object.entries(countriesByCode).map(
    ([code, name]) => ({
      code,
      name,
    })
  );
  const { setAside, popAside, stack } = useAsideStore();
  const queryClient = useQueryClient();
  const { createOffice, offices } = useOffices();

  const schema = createOfficeSchema(offices);

  const methods = useForm<OfficeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      country: "",
      state: "",
      city: "",
      zipCode: "",
      address: "",
      apartment: "",
      additionalInfo: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  const isSaveButtonEnabled = () => {
    if (isSubmitting) return false;
    return isDirty;
  };

  const onSubmit = async (data: OfficeFormData) => {
    try {
      if (!data.name || data.name.trim() === "") {
        console.error("Office name is required");
        return;
      }
      if (!data.country || data.country.trim() === "") {
        console.error("Country is required");
        return;
      }
      const officeData: CreateOfficeType = {
        name: data.name.trim(),
        country: data.country.trim(),
        ...(data.email &&
          data.email.trim() !== "" && { email: data.email.trim() }),
        ...(data.phone &&
          data.phone.trim() !== "" && { phone: data.phone.trim() }),
        ...(data.state &&
          data.state.trim() !== "" && { state: data.state.trim() }),
        ...(data.city && data.city.trim() !== "" && { city: data.city.trim() }),
        ...(data.zipCode &&
          data.zipCode.trim() !== "" && { zipCode: data.zipCode.trim() }),
        ...(data.address &&
          data.address.trim() !== "" && { address: data.address.trim() }),
        ...(data.apartment &&
          data.apartment.trim() !== "" && { apartment: data.apartment.trim() }),
        ...(data.additionalInfo &&
          data.additionalInfo.trim() !== "" && {
            additionalInfo: data.additionalInfo.trim(),
          }),
      };

      createOffice(officeData);
      if (stack.length > 1) {
        popAside();
      } else {
        setAside(null);
      }
    } catch (error) {
      console.error("Error creating office:", error);
    }
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
      <div className="flex items-center gap-3 mb-4">
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
            <div className="gap-4 grid grid-cols-2 mt-8">
              <FormField
                control={methods.control}
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
                    <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                      Contact Phone Number
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
                    <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                      Country *
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
                        required="required"
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
                    <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                      State
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
                    <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                      City
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
                    <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                      Zip Code
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
                    <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
                      Address
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
            {isSubmitting ? "Creating..." : "Create Office"}
          </Button>
        </div>
      </aside>
    </div>
  );
};

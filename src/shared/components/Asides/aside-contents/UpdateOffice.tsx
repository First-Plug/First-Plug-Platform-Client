"use client";

import { useForm, FormProvider } from "react-hook-form";
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

const updateOfficeSchema = z.object({
  name: z.string().min(1, "Office name is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  apartment: z.string().optional().or(z.literal("")),
  additionalInfo: z.string().optional().or(z.literal("")),
});

type UpdateOfficeFormData = z.infer<typeof updateOfficeSchema>;

export const UpdateOffice = () => {
  // Crear lista de países con código y nombre
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

  // Función para verificar si el botón Save debe estar habilitado
  const isSaveButtonEnabled = () => {
    if (isSubmitting) return false;

    // Permitir que el botón esté habilitado si hay cambios,
    // la validación se hará en onSubmit para mostrar errores
    return isDirty;
  };

  const onSubmit = async (data: UpdateOfficeFormData) => {
    if (!selectedTenant && !selectedOffice) return;

    // Let Zod validation handle the validation first
    // If we reach here, the form should be valid according to Zod schema

    // Send all fields that have been modified (including empty strings to clear fields)
    // Compare with original values to detect changes
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
      // Include field if it has changed (including changes to empty string)
      if (value !== originalValue) {
        acc[key as keyof UpdateOfficeFormData] = value || ""; // Send empty string to clear field
      }
      return acc;
    }, {} as Partial<UpdateOfficeFormData>);

    // Only proceed if there are actual changes to send
    if (Object.keys(filteredData).length === 0) {
      // No changes to save - just close the aside
      setAside(null);
      return;
    }

    // Additional validation: if name is being changed to empty, don't allow it
    if (
      filteredData.name !== undefined &&
      (!filteredData.name || filteredData.name.trim() === "")
    ) {
      console.log(
        "❌ Validation failed: Office name is being changed to empty"
      );
      // Don't send the request, the validation should have been caught by Zod
      return;
    }

    try {
      if (selectedTenant) {
        // Update tenant office
        await updateOfficeMutation.mutateAsync({
          tenantId: selectedTenant.id,
          data: filteredData,
        });
      } else if (selectedOffice) {
        // Update individual office
        updateOffice(selectedOffice._id, filteredData);
      }
      setAside(null);
    } catch (error) {
      console.error("Error updating office:", error);
    }
  };

  const handleGoBack = () => {
    // Solo hacer pop si hay más de una sidebar en el stack
    if (stack.length > 1) {
      popAside();
    } else {
      // Si solo hay una sidebar, cerrar todo
      setAside(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header con botón de volver atrás */}
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
            {/* Primera fila - Nombre y Email */}
            <div className="gap-4 grid grid-cols-2 mt-8">
              <FormField
                control={methods.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block ml-2 font-sans text-dark-grey text-sm">
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

            {/* Segunda fila - Teléfono y País */}
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
                    <DropdownInputProductForm
                      title="Country"
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tercera fila - Estado y Ciudad */}
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

            {/* Cuarta fila - ZIP Code y Address */}
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
                        className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[80px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
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

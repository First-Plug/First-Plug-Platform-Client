"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAsideStore, Button } from "@/shared";
import { Tenant, useUpdateTenantOffice } from "@/features/tenants";
import { useQueryClient } from "@tanstack/react-query";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectItem,
  SelectContent,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/shared";
import fields from "@/features/members/components/AddMember/JSON/shipmentdata.json";

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
});

type UpdateOfficeFormData = z.infer<typeof updateOfficeSchema>;

const countryOptions = fields.fields[0].options;

export const UpdateOffice = () => {
  const { setAside } = useAsideStore();
  const queryClient = useQueryClient();
  const selectedTenant = queryClient.getQueryData<Tenant>(["selectedTenant"]);
  const updateOfficeMutation = useUpdateTenantOffice();

  const methods = useForm<UpdateOfficeFormData>({
    resolver: zodResolver(updateOfficeSchema),
    defaultValues: {
      name: selectedTenant?.office?.name || "",
      email: selectedTenant?.office?.email || "",
      phone: selectedTenant?.office?.phone || "",
      country: selectedTenant?.office?.country || "",
      state: selectedTenant?.office?.state || "",
      city: selectedTenant?.office?.city || "",
      zipCode: selectedTenant?.office?.zipCode || "",
      address: selectedTenant?.office?.address || "",
      apartment: selectedTenant?.office?.apartment || "",
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
    if (!selectedTenant) return;

    // Let Zod validation handle the validation first
    // If we reach here, the form should be valid according to Zod schema

    // Send all fields that have been modified (including empty strings to clear fields)
    // Compare with original values to detect changes
    const originalData = {
      name: selectedTenant?.office?.name || "",
      email: selectedTenant?.office?.email || "",
      phone: selectedTenant?.office?.phone || "",
      country: selectedTenant?.office?.country || "",
      state: selectedTenant?.office?.state || "",
      city: selectedTenant?.office?.city || "",
      zipCode: selectedTenant?.office?.zipCode || "",
      address: selectedTenant?.office?.address || "",
      apartment: selectedTenant?.office?.apartment || "",
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
      await updateOfficeMutation.mutateAsync({
        tenantId: selectedTenant.id,
        data: filteredData,
      });
      setAside(null);
    } catch (error) {
      console.error("Error updating office:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
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
                    <FormLabel>Office Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter office name"
                        {...field}
                        className="py-2 w-full h-14 text-lg"
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contact email"
                        type="email"
                        {...field}
                        className="py-2 w-full h-14 text-lg"
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
                    <FormLabel>Contact Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+54 11 15466052"
                        {...field}
                        className="py-2 w-full h-14 text-lg"
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
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="py-2 w-full h-14 text-lg">
                          {field.value ? (
                            <SelectValue
                              placeholder="Select Country"
                              className="opacity-10"
                            />
                          ) : (
                            <span className="text-grey">Select Country</span>
                          )}
                        </SelectTrigger>
                        <SelectContent className="bg-white max-h-60">
                          <SelectGroup>
                            <SelectLabel>Location</SelectLabel>
                            {countryOptions.map((option) => (
                              <SelectItem value={option} key={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
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
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="State"
                        {...field}
                        className="py-2 w-full h-14 text-lg"
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
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City"
                        {...field}
                        className="py-2 w-full h-14 text-lg"
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
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Zip Code"
                        {...field}
                        className="py-2 w-full h-14 text-lg"
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
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Address"
                        {...field}
                        className="py-2 w-full h-14 text-lg"
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
                      <FormLabel>Apartment, Suite, etc.</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apartment, suite, etc."
                          {...field}
                          className="py-2 w-full h-14 text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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

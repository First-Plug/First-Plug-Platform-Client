"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Select,
  SelectItem,
  SelectContent,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";

const createOfficeSchema = z.object({
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

type CreateOfficeFormData = z.infer<typeof createOfficeSchema>;

export const CreateOffice = () => {
  // Crear lista de países con código y nombre
  const countryOptions = Object.entries(countriesByCode).map(
    ([code, name]) => ({
      code,
      name,
    })
  );
  const { setAside, popAside, stack } = useAsideStore();
  const queryClient = useQueryClient();
  const { createOffice } = useOffices();

  const methods = useForm<CreateOfficeFormData>({
    resolver: zodResolver(createOfficeSchema),
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

  const onSubmit = async (data: CreateOfficeFormData) => {
    try {
      // Ensure name is provided (required field)
      if (!data.name || data.name.trim() === "") {
        console.error("Office name is required");
        return;
      }

      // Create office data with only non-empty fields
      const officeData: CreateOfficeType = {
        name: data.name.trim(),
        ...(data.email &&
          data.email.trim() !== "" && { email: data.email.trim() }),
        ...(data.phone &&
          data.phone.trim() !== "" && { phone: data.phone.trim() }),
        ...(data.country &&
          data.country.trim() !== "" && { country: data.country.trim() }),
        ...(data.state &&
          data.state.trim() !== "" && { state: data.state.trim() }),
        ...(data.city && data.city.trim() !== "" && { city: data.city.trim() }),
        ...(data.zipCode &&
          data.zipCode.trim() !== "" && { zipCode: data.zipCode.trim() }),
        ...(data.address &&
          data.address.trim() !== "" && { address: data.address.trim() }),
        ...(data.apartment &&
          data.apartment.trim() !== "" && { apartment: data.apartment.trim() }),
      };

      createOffice(officeData);
      setAside(null);
    } catch (error) {
      console.error("Error creating office:", error);
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
        <h3 className="font-semibold text-gray-900 text-lg">Create Office</h3>
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
                            >
                              {countriesByCode[field.value]}
                            </SelectValue>
                          ) : (
                            <span className="text-grey">Select Country</span>
                          )}
                        </SelectTrigger>
                        <SelectContent className="bg-white max-h-60">
                          <SelectGroup>
                            <SelectLabel>Location</SelectLabel>
                            {countryOptions.map((option) => (
                              <SelectItem value={option.code} key={option.code}>
                                {option.name}
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
            {isSubmitting ? "Creating..." : "Create Office"}
          </Button>
        </div>
      </aside>
    </div>
  );
};

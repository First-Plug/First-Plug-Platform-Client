"use client";

import { useState, useMemo } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAsideStore, Button, LoaderSpinner, Input } from "@/shared";
import { Tenant, useUpdateTenantOffice } from "@/features/tenants";
import { useQueryClient } from "@tanstack/react-query";
import { Office } from "@/features/settings/types/settings.types";
import { countriesByCode } from "@/shared/constants/country-codes";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input as FormInput,
  Select,
  SelectItem,
  SelectContent,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/shared";
import { OfficeCard } from "@/features/settings/components/office-card";
import { Building, Plus, Search, ArrowLeft } from "lucide-react";

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

export const UpdateOfficeWithCards = () => {
  // Crear lista de países con código y nombre
  const countryOptions = Object.entries(countriesByCode).map(
    ([code, name]) => ({
      code,
      name,
    })
  );
  const { setAside, pushAside, popAside, stack } = useAsideStore();
  const queryClient = useQueryClient();
  const selectedTenant = queryClient.getQueryData<Tenant>(["selectedTenant"]);
  const updateOfficeMutation = useUpdateTenantOffice();

  // Estado para manejar la vista actual (formulario o cards)
  const [currentView, setCurrentView] = useState<"form" | "cards">("cards");
  const [searchTerm, setSearchTerm] = useState("");

  // Convertir la oficina del tenant a formato Office para mostrar como card
  const tenantOffice: Office | null = useMemo(() => {
    if (!selectedTenant?.office) return null;

    return {
      _id: selectedTenant.office.id,
      name: selectedTenant.office.name,
      email: selectedTenant.office.email,
      phone: selectedTenant.office.phone,
      address: selectedTenant.office.address,
      apartment: selectedTenant.office.apartment,
      city: selectedTenant.office.city,
      state: selectedTenant.office.state,
      country: selectedTenant.office.country,
      zipCode: selectedTenant.office.zipCode,
      isDefault: selectedTenant.office.isDefault,
      isActive: true,
      isDeleted: false,
      deletedAt: null,
      tenantId: selectedTenant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
      hasAssignedProducts: false,
      hasActiveShipments: false,
    };
  }, [selectedTenant]);

  // Filtrar oficinas basado en el término de búsqueda (solo la oficina del tenant)
  const filteredOffices: Office[] = useMemo(() => {
    if (!tenantOffice) return [];

    if (!searchTerm.trim()) return [tenantOffice];

    const office = tenantOffice;
    const searchTermLower = searchTerm.toLowerCase();

    // Búsqueda básica: nombre, ciudad, email
    const basicMatch =
      office.name.toLowerCase().includes(searchTermLower) ||
      office.city?.toLowerCase().includes(searchTermLower) ||
      office.email?.toLowerCase().includes(searchTermLower);

    // Búsqueda por código de país
    const countryCodeMatch = office.country
      ?.toLowerCase()
      .includes(searchTermLower);

    // Búsqueda por nombre completo del país
    let countryNameMatch = false;
    if (office.country && countriesByCode[office.country]) {
      const fullCountryName = countriesByCode[office.country];
      countryNameMatch = fullCountryName
        .toLowerCase()
        .includes(searchTermLower);
    }

    // Búsqueda por estado
    const stateMatch = office.state?.toLowerCase().includes(searchTermLower);

    const matchesSearch =
      basicMatch || countryCodeMatch || countryNameMatch || stateMatch;

    return matchesSearch ? [office] : [];
  }, [tenantOffice, searchTerm]);

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

  // Función para verificar si el botón Save debe estar habilitado
  const isSaveButtonEnabled = () => {
    if (isSubmitting) return false;
    return isDirty;
  };

  const onSubmit = async (data: UpdateOfficeFormData) => {
    if (!selectedTenant) return;

    // Send all fields that have been modified
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
      if (value !== originalValue) {
        acc[key as keyof UpdateOfficeFormData] = value || "";
      }
      return acc;
    }, {} as Partial<UpdateOfficeFormData>);

    if (Object.keys(filteredData).length === 0) {
      setAside(null);
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

  const handleAddOffice = () => {
    setAside("CreateOffice");
  };

  const handleDeleteOffice = (id: string) => {
    // Eliminar la oficina del tenant
    if (selectedTenant) {
      // TODO: Implementar eliminación de oficina del tenant
      // Por ahora, solo mostramos un mensaje
      console.log("Deleting tenant office:", id);
      // Ejemplo: await deleteTenantOfficeMutation.mutateAsync(selectedTenant.id);
    }
  };

  const handleEditOffice = (office: Office) => {
    queryClient.setQueryData(["selectedOffice"], office);
    pushAside("UpdateOffice");
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

  const renderCardsView = () => {
    if (!selectedTenant) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <Building className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <h3 className="mb-2 font-medium text-gray-900 text-sm">
              No tenant selected
            </h3>
            <p className="text-gray-500 text-sm">
              Please select a tenant to view their office information.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Header con información del tenant */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
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
            <div>
              <p className="text-gray-600 text-sm">
                Tenant: {selectedTenant.tenantName}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
          <Input
            placeholder="Search offices by name, city, country, or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="mb-4 text-gray-600 text-sm">
          {filteredOffices.length}{" "}
          {filteredOffices.length === 1 ? "office" : "offices"}
        </div>

        {/* Offices Grid */}
        <div className="flex-1 overflow-y-auto">
          {!tenantOffice ? (
            <div className="py-12 text-center">
              <Building className="mx-auto w-12 h-12 text-gray-400" />
              <h3 className="mt-2 font-medium text-gray-900 text-sm">
                No office configured
              </h3>
              <p className="mt-1 text-gray-500 text-sm">
                This tenant doesn&apos;t have an office configured yet.
              </p>
              <div className="mt-6">
                <Button onClick={handleAddOffice} variant="primary">
                  <Plus className="mr-2 w-4 h-4" />
                  Add Office
                </Button>
              </div>
            </div>
          ) : filteredOffices.length === 0 ? (
            <div className="py-12 text-center">
              <Building className="mx-auto w-12 h-12 text-gray-400" />
              <h3 className="mt-2 font-medium text-gray-900 text-sm">
                No offices found
              </h3>
              <p className="mt-1 text-gray-500 text-sm">
                Try adjusting your search terms.
              </p>
            </div>
          ) : (
            <div className="gap-4 grid grid-cols-1">
              {filteredOffices?.map((office: Office) => (
                <OfficeCard
                  key={office._id}
                  office={office}
                  onDelete={handleDeleteOffice}
                  onSetDefault={() => {}} // Función vacía ya que no se maneja setDefault en este contexto
                  isDeleting={false}
                  isSettingDefault={false}
                  canDelete={true} // Permitimos eliminar oficinas de tenant
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFormView = () => (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
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
          <h3 className="font-semibold text-gray-900 text-lg">Edit Office</h3>
        </div>
        <Button
          onClick={() => setCurrentView("cards")}
          variant="secondary"
          size="small"
        >
          Back to Offices
        </Button>
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
                    Incomplete Data for Shipments
                  </h3>
                  <p className="mt-1 text-yellow-700 text-sm">
                    This office is missing required information for shipments.
                    Please complete the following fields:{" "}
                    <span className="font-medium">
                      {missingFields
                        .map((field) => {
                          // Formatear nombres de campos
                          const fieldLabels: Record<string, string> = {
                            name: "Office Name",
                            phone: "Contact Phone Number",
                            country: "Country",
                            state: "State",
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

            {/* Primera fila - Nombre y Email */}
            <div className="gap-4 grid grid-cols-2 mt-8">
              <FormField
                control={methods.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Office Name
                      {isRequiredForShipment("name") &&
                        isFieldIncomplete("name") && <ShipmentRequiredBadge />}
                    </FormLabel>
                    <FormControl>
                      <FormInput
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
                      <FormInput
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
                    <FormLabel className="flex items-center gap-2">
                      Contact Phone Number
                      {isRequiredForShipment("phone") &&
                        isFieldIncomplete("phone") && <ShipmentRequiredBadge />}
                    </FormLabel>
                    <FormControl>
                      <FormInput
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
                    <FormLabel className="flex items-center gap-2">
                      Country
                      {isRequiredForShipment("country") &&
                        isFieldIncomplete("country") && (
                          <ShipmentRequiredBadge />
                        )}
                    </FormLabel>
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
                    <FormLabel className="flex items-center gap-2">
                      State
                      {isRequiredForShipment("state") &&
                        isFieldIncomplete("state") && <ShipmentRequiredBadge />}
                    </FormLabel>
                    <FormControl>
                      <FormInput
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
                    <FormLabel className="flex items-center gap-2">
                      City
                      {isRequiredForShipment("city") &&
                        isFieldIncomplete("city") && <ShipmentRequiredBadge />}
                    </FormLabel>
                    <FormControl>
                      <FormInput
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
                    <FormLabel className="flex items-center gap-2">
                      Zip Code
                      {isRequiredForShipment("zipCode") &&
                        isFieldIncomplete("zipCode") && (
                          <ShipmentRequiredBadge />
                        )}
                    </FormLabel>
                    <FormControl>
                      <FormInput
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
                    <FormLabel className="flex items-center gap-2">
                      Address
                      {isRequiredForShipment("address") &&
                        isFieldIncomplete("address") && (
                          <ShipmentRequiredBadge />
                        )}
                    </FormLabel>
                    <FormControl>
                      <FormInput
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
                        <FormInput
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

  return currentView === "cards" ? renderCardsView() : renderFormView();
};

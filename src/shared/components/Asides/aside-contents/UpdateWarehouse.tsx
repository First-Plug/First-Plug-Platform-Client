"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAsideStore, Button, countriesByCode } from "@/shared";
import { InputProductForm, DropdownInputProductForm } from "@/features/assets";
import { WarehouseDetails } from "@/features/warehouses";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateWarehouse } from "@/features/warehouses/hooks/useUpdateWarehouse";
import { useAlertStore } from "@/shared/stores/alerts.store";

const updateWarehouseSchema = z
  .object({
    id: z.string().min(1, "ID is required"),
    name: z.string(),
    country: z.string().min(1, "Country is required"),
    state: z.string(),
    city: z.string(),
    zipCode: z.string(),
    address: z.string(),
    apartment: z.string().optional(),
    phoneContact: z.string().optional(),
    email: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    partnerType: z.string().min(1, "Partner type is required"),
    contactChannel: z.string().optional(),
    contactPerson: z.string().optional(),
    additionalInfo: z.string().optional(),
    isActive: z.string().min(1, "Active status is required"),
  })
  .refine(
    (data) => {
      if (data.isActive === "Yes") {
        return data.name?.trim().length > 0;
      }
      return true;
    },
    {
      message: "Warehouse name is required to activate the warehouse",
      path: ["name"],
    }
  )
  .refine(
    (data) => {
      if (data.isActive === "Yes") {
        return data.address?.trim().length > 0;
      }
      return true;
    },
    {
      message: "Address is required to activate the warehouse",
      path: ["address"],
    }
  )
  .refine(
    (data) => {
      if (data.isActive === "Yes") {
        return data.city?.trim().length > 0;
      }
      return true;
    },
    {
      message: "City is required to activate the warehouse",
      path: ["city"],
    }
  )
  .refine(
    (data) => {
      if (data.isActive === "Yes") {
        return data.state?.trim().length > 0;
      }
      return true;
    },
    {
      message: "State/Province is required to activate the warehouse",
      path: ["state"],
    }
  )
  .refine(
    (data) => {
      if (data.isActive === "Yes") {
        return data.zipCode?.trim().length > 0;
      }
      return true;
    },
    {
      message: "Zip Code is required to activate the warehouse",
      path: ["zipCode"],
    }
  );

type UpdateWarehouseFormData = z.infer<typeof updateWarehouseSchema>;

export const UpdateWarehouse = () => {
  // Convert countriesByCode to options format for dropdown
  const countryOptions = Object.entries(countriesByCode).map(
    ([code, name]) => ({
      label: name,
      value: code,
    })
  );
  const { setAside } = useAsideStore();
  const { setAlert } = useAlertStore();
  const updateWarehouseMutation = useUpdateWarehouse();

  const queryClient = useQueryClient();
  const selectedWarehouse = queryClient.getQueryData<WarehouseDetails>([
    "selectedWarehouse",
  ]);

  const methods = useForm<UpdateWarehouseFormData>({
    resolver: zodResolver(updateWarehouseSchema),
    defaultValues: {
      id: selectedWarehouse?.id || "",
      name: selectedWarehouse?.name || "",
      country: selectedWarehouse?.country || "",
      state: selectedWarehouse?.state || "",
      city: selectedWarehouse?.city || "",
      zipCode: selectedWarehouse?.zipCode || "",
      address: selectedWarehouse?.address || "",
      apartment: selectedWarehouse?.apartment || "",
      phoneContact: selectedWarehouse?.phoneContact || "",
      email: selectedWarehouse?.email || "",
      partnerType: selectedWarehouse?.partnerType || "",
      contactChannel: selectedWarehouse?.contactChannel || "",
      contactPerson: selectedWarehouse?.contactPerson || "",
      additionalInfo: selectedWarehouse?.additionalInfo || "",
      isActive: selectedWarehouse?.isActive ? "Yes" : "No",
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: UpdateWarehouseFormData) => {
    try {
      // Transform data to match API expectations
      const updateData = {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        apartment: data.apartment || undefined,
        phone: data.phoneContact || undefined,
        email: data.email || undefined,
        partnerType: data.partnerType,
        canal: data.contactChannel || undefined,
        contactPerson: data.contactPerson || undefined,
        additionalInfo: data.additionalInfo || undefined,
        isActive: data.isActive === "Yes",
      };

      await updateWarehouseMutation.mutateAsync({
        country: data.country,
        warehouseId: data.id,
        data: updateData,
      });

      setAlert("dataUpdatedSuccessfully");
      setAside(null);
    } catch (error: any) {
      console.error("Error updating warehouse:", error);
      // TODO: Add specific warehouse error alert types
      setAlert("dynamicWarning", {
        message: error?.response?.data?.message || "Failed to update warehouse",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pr-4">
            {/* Fila 9: Is Active */}
            <div className="mt-4">
              <DropdownInputProductForm
                title="Is Active?"
                placeholder="Select status"
                options={["Yes", "No"]}
                selectedOption={watch("isActive")}
                onChange={(value) => setValue("isActive", value)}
                name="isActive"
              />
              {errors.isActive && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.isActive.message}
                </p>
              )}
            </div>
            {/* Fila 1: Warehouse Name y Country */}
            <div className="gap-4 grid grid-cols-2 mt-8">
              <div>
                <InputProductForm
                  title="Warehouse Name"
                  placeholder="Enter warehouse name"
                  value={watch("name")}
                  onChange={(e) => {
                    setValue("name", e.target.value);
                  }}
                  name="name"
                />
                {errors.name && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <DropdownInputProductForm
                  title="Country"
                  placeholder="Select country"
                  options={countryOptions.map((option) => option.label)}
                  selectedOption={
                    watch("country")
                      ? countriesByCode[watch("country")] || watch("country")
                      : ""
                  }
                  onChange={(selectedCountryName) => {
                    const countryCode = Object.entries(countriesByCode).find(
                      ([code, name]) => name === selectedCountryName
                    )?.[0];
                    setValue("country", countryCode || "");
                  }}
                  name="country"
                  searchable={true}
                  disabled={true}
                />
                {errors.country && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 2: State y City */}
            <div className="gap-4 grid grid-cols-2">
              <div>
                <InputProductForm
                  title="State/Province"
                  placeholder="Enter state/province"
                  value={watch("state")}
                  onChange={(e) => {
                    setValue("state", e.target.value);
                  }}
                  name="state"
                />
                {errors.state && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.state.message}
                  </p>
                )}
              </div>
              <div>
                <InputProductForm
                  title="City"
                  placeholder="Enter city"
                  value={watch("city")}
                  onChange={(e) => {
                    setValue("city", e.target.value);
                  }}
                  name="city"
                />
                {errors.city && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 3: Zip Code y Address */}
            <div className="gap-4 grid grid-cols-2">
              <div>
                <InputProductForm
                  title="Zip Code"
                  placeholder="Enter zip code"
                  value={watch("zipCode")}
                  onChange={(e) => {
                    setValue("zipCode", e.target.value);
                  }}
                  name="zipCode"
                />
                {errors.zipCode && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.zipCode.message}
                  </p>
                )}
              </div>
              <div>
                <InputProductForm
                  title="Address"
                  placeholder="Enter address"
                  value={watch("address")}
                  onChange={(e) => {
                    setValue("address", e.target.value);
                  }}
                  name="address"
                />
                {errors.address && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 4: Apartment (ancho completo) */}
            <div>
              <InputProductForm
                title="Apartment, Suite, etc. (Optional)"
                placeholder="Apartment, suite, floor, etc."
                value={watch("apartment")}
                onChange={(e) => {
                  setValue("apartment", e.target.value);
                }}
                name="apartment"
              />
            </div>

            {/* Fila 5: Phone Contact y Email */}
            <div className="gap-4 grid grid-cols-2">
              <div>
                <InputProductForm
                  title="Phone Contact (Optional)"
                  placeholder="Phone number"
                  value={watch("phoneContact")}
                  onChange={(e) => {
                    setValue("phoneContact", e.target.value);
                  }}
                  name="phoneContact"
                />
              </div>
              <div>
                <InputProductForm
                  title="Email (Optional)"
                  placeholder="Email address"
                  value={watch("email")}
                  onChange={(e) => {
                    setValue("email", e.target.value);
                  }}
                  name="email"
                />
                {errors.email && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 6: Partner Type y Contact Channel */}
            <div className="gap-4 grid grid-cols-2">
              <div>
                <DropdownInputProductForm
                  title="Partner Type"
                  placeholder="Select type"
                  options={["default", "own", "partner", "temporary"]}
                  selectedOption={watch("partnerType")}
                  onChange={(value) => setValue("partnerType", value)}
                  name="partnerType"
                />
                {errors.partnerType && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.partnerType.message}
                  </p>
                )}
              </div>
              <div>
                <DropdownInputProductForm
                  title="Contact Channel (Optional)"
                  placeholder="Select channel"
                  options={["whatsapp", "slack", "mail", "phone"]}
                  selectedOption={watch("contactChannel")}
                  onChange={(value) => setValue("contactChannel", value)}
                  name="contactChannel"
                />
                {errors.contactChannel && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.contactChannel.message}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 7: Contact Person (ancho completo) */}
            <div>
              <InputProductForm
                title="Contact Person (Optional)"
                placeholder="Contact person name"
                value={watch("contactPerson")}
                onChange={(e) => {
                  setValue("contactPerson", e.target.value);
                }}
                name="contactPerson"
              />
            </div>

            {/* Fila 8: Additional Info (ancho completo) */}
            <div>
              <InputProductForm
                title="Additional Info (Optional)"
                placeholder="Additional information"
                type="textarea"
                value={watch("additionalInfo")}
                onChange={(e) => {
                  setValue("additionalInfo", e.target.value);
                }}
                name="additionalInfo"
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
            disabled={isSubmitting || updateWarehouseMutation.isPending}
          >
            {isSubmitting || updateWarehouseMutation.isPending
              ? "Guardando..."
              : "Guardar"}
          </Button>
        </div>
      </aside>
    </div>
  );
};

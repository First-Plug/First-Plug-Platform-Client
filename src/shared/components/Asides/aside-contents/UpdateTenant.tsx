"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InputProductForm } from "@/features/assets";
import { useAsideStore, useAlertStore, Button } from "@/shared";
import { Tenant, useUpdateTenant } from "@/features/tenants";
import { useQueryClient } from "@tanstack/react-query";
import { MinusIcon, AddIcon } from "@/shared";
import { Controller } from "react-hook-form";
import * as Switch from "@radix-ui/react-switch";
import { CATEGORIES } from "@/features/assets/interfaces/product";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "@radix-ui/react-tooltip";
import { InfoCircle } from "@/shared";
import { useState, useEffect } from "react";

const updateTenantSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  computerExpiration: z
    .number()
    .min(0.5, "Computer expiration years must be at least 0.5")
    .max(10, "Computer expiration years cannot exceed 10"),
  recoverableCategories: z
    .array(z.string())
    .min(1, "At least one recoverable category is required"),
  image: z.string().optional(),
});

type UpdateTenantFormData = z.infer<typeof updateTenantSchema>;

export const UpdateTenant = () => {
  const { setAside } = useAsideStore();
  const { setAlert } = useAlertStore();
  const queryClient = useQueryClient();
  const selectedTenant = queryClient.getQueryData<Tenant>(["selectedTenant"]);
  const updateTenantMutation = useUpdateTenant();

  const methods = useForm<UpdateTenantFormData>({
    resolver: zodResolver(updateTenantSchema),
    defaultValues: {
      name: selectedTenant?.name || "",
      computerExpiration: selectedTenant?.computerExpirationYears || 3,
      recoverableCategories: selectedTenant?.recoverableConfig
        ? Object.keys(selectedTenant.recoverableConfig).filter(
            (key) => selectedTenant.recoverableConfig[key]
          )
        : ["Computer", "Monitor", "Peripherals"],
      image: "",
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  // Valores por defecto para comparar
  const defaultValues = {
    name: selectedTenant?.name || "",
    computerExpiration: 3,
    recoverableCategories: ["Computer", "Monitor", "Peripherals"],
    image: "",
  };

  // Función para verificar si el formulario está en su estado original
  const isFormInDefaultState = () => {
    const currentValues = getValues();
    return (
      currentValues.name === defaultValues.name &&
      currentValues.computerExpiration === defaultValues.computerExpiration &&
      JSON.stringify(currentValues.recoverableCategories.sort()) ===
        JSON.stringify(defaultValues.recoverableCategories.sort()) &&
      currentValues.image === defaultValues.image
    );
  };

  // Estado local para controlar si el formulario está modificado
  const [isModified, setIsModified] = useState(false);

  // Detectar cambios en el formulario
  useEffect(() => {
    const subscription = watch((value) => {
      const isInDefaultState = isFormInDefaultState();
      setIsModified(!isInDefaultState);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: UpdateTenantFormData) => {
    if (!selectedTenant) return;

    try {
      const updateData = {
        name: data.name,
        computerExpiration: data.computerExpiration,
        isRecoverableConfig: data.recoverableCategories.reduce(
          (acc, category) => {
            acc[category] = true;
            return acc;
          },
          {} as Record<string, boolean>
        ),
      };

      await updateTenantMutation.mutateAsync({
        id: selectedTenant.id,
        data: updateData,
      });
      setAside(null);
    } catch (error) {
      console.error("Error updating tenant:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pr-4">
            <div className="mt-8">
              <div className="relative">
                <label className="block ml-2 font-sans text-dark-grey">
                  Tenant Name (ID)
                </label>
                <input
                  name="tenantName"
                  type="text"
                  value={selectedTenant?.tenantName || ""}
                  onChange={() => {}} // No-op since it's disabled
                  placeholder="Tenant identifier"
                  className="w-full h-14 py-2 rounded-xl border p-4 font-sans focus:outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled={true}
                  readOnly={true}
                />
              </div>
              <p className="mt-1 text-gray-500 text-xs">
                Tenant name cannot be modified
              </p>
            </div>

            <div className="mt-6">
              <InputProductForm
                title="Company Name"
                placeholder="Enter company name"
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

            {/* Computer Expiration Settings */}
            <div>
              <div className="flex items-center mb-3">
                <h3 className="font-montserrat font-bold text-black text-lg">
                  Computer Expiration Settings{" "}
                  <span className="font-normal text-base">(years)</span>
                </h3>
              </div>

              <Controller
                name="computerExpiration"
                control={methods.control}
                render={({ field }) => (
                  <div className="flex flex-col items-start">
                    <div className="flex items-center p-4 border rounded-xl w-full h-14 text-black">
                      <button
                        type="button"
                        onClick={() => {
                          const newValue = Math.max(
                            0.5,
                            Number(field.value) - 0.5
                          );
                          setValue("computerExpiration", newValue);
                        }}
                        className="hover:bg-gray-100 p-1 px-2 rounded"
                      >
                        <MinusIcon />
                      </button>
                      <input
                        type="number"
                        value={field.value}
                        readOnly
                        className="justify-center items-center bg-transparent ml-4 w-10 font-montserrat font-semibold text-md text-center tracking-wide appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newValue = Math.min(
                            10,
                            Number(field.value) + 0.5
                          );
                          setValue("computerExpiration", newValue);
                        }}
                        className="hover:bg-gray-100 p-1 px-2 rounded"
                      >
                        <AddIcon />
                      </button>
                    </div>
                  </div>
                )}
              />
              {errors.computerExpiration && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.computerExpiration.message}
                </p>
              )}
            </div>

            {/* Recoverable Categories */}
            <div>
              <div className="flex items-center mb-3">
                <h3 className="font-montserrat font-bold text-black text-lg">
                  Recoverable Categories
                </h3>
              </div>

              <div className="gap-4 grid grid-cols-2">
                {CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-3">
                    <Switch.Root
                      checked={watch("recoverableCategories").includes(
                        category
                      )}
                      onCheckedChange={(checked) => {
                        const currentCategories = watch(
                          "recoverableCategories"
                        );
                        if (checked) {
                          const newCategories = [
                            ...currentCategories,
                            category,
                          ];
                          setValue("recoverableCategories", newCategories);
                        } else {
                          const newCategories = currentCategories.filter(
                            (cat) => cat !== category
                          );
                          setValue("recoverableCategories", newCategories);
                        }
                      }}
                      className={`w-10 h-6 bg-blue/80 rounded-full relative transition-colors duration-200
                        ${
                          watch("recoverableCategories").includes(category)
                            ? "bg-blue/80"
                            : "bg-gray-300"
                        }`}
                    >
                      <Switch.Thumb
                        className={`block w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 transform-gpu
                          ${
                            watch("recoverableCategories").includes(category)
                              ? "translate-x-5"
                              : "translate-x-1"
                          }`}
                      />
                    </Switch.Root>
                    <span className="font-medium text-sm">{category}</span>
                  </div>
                ))}
              </div>
              {errors.recoverableCategories && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.recoverableCategories.message}
                </p>
              )}
            </div>

            <div>
              <InputProductForm
                title="Image URL"
                placeholder="Enter image URL"
                value={watch("image")}
                onChange={(e) => {
                  setValue("image", e.target.value);
                }}
                name="image"
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
            disabled={isSubmitting || !isModified}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </aside>
    </div>
  );
};

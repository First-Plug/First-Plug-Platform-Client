"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCompanySettings } from "../hooks/use-company-settings";
import {
  Button,
  LoaderSpinner,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/shared";
import { RecoverableConfigForm } from "./recoverable-config-form";
import { ComputerExpirationConfig } from "./computer-expiration-config";
import { useEffect } from "react";
import { companySchema, CompanyFormData } from "../schemas/company.schema";

export const CompanySettings = () => {
  const { tenantConfig, isLoading, updateConfig, isUpdating } =
    useCompanySettings();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      isRecoverableConfig: {},
      computerExpiration: 2,
    },
  });

  useEffect(() => {
    if (tenantConfig) {
      form.reset({
        name: tenantConfig.name || "",
        isRecoverableConfig: tenantConfig.isRecoverableConfig || {},
        computerExpiration: tenantConfig.computerExpiration || 2,
      });
    }
  }, [tenantConfig, form]);

  // Función para verificar si el botón Save debe estar habilitado
  const isSaveButtonEnabled = () => {
    if (!form.formState.isDirty || isUpdating) return false;

    const currentValues = form.getValues();
    const originalValues = {
      name: tenantConfig?.name || "",
      isRecoverableConfig: tenantConfig?.isRecoverableConfig || {},
      computerExpiration: tenantConfig?.computerExpiration || 2,
    };

    // Si el name está vacío, no permitir guardar
    if (!currentValues.name?.trim()) return false;

    // Verificar si hay cambios válidos (no solo borrar el name)
    const hasNameChange = currentValues.name !== originalValues.name;
    const hasRecoverableChange =
      JSON.stringify(currentValues.isRecoverableConfig) !==
      JSON.stringify(originalValues.isRecoverableConfig);
    const hasExpirationChange =
      currentValues.computerExpiration !== originalValues.computerExpiration;

    // Si el único cambio es borrar el name (dejarlo vacío), no habilitar
    if (
      hasNameChange &&
      !currentValues.name?.trim() &&
      !hasRecoverableChange &&
      !hasExpirationChange
    ) {
      return false;
    }

    return true;
  };

  const onSubmit = (data: any) => {
    // Procesar datos para permitir borrado de campos opcionales
    const processedData: any = {
      isRecoverableConfig: data.isRecoverableConfig,
      computerExpiration: data.computerExpiration,
    };

    // Solo incluir name si no está vacío, o enviarlo como string vacío para borrarlo
    if (data.name !== undefined) {
      processedData.name = data.name || "";
    }

    console.log("🔧 COMPANY UPDATE - Sending data:", processedData);
    updateConfig(processedData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderSpinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <div className="mb-6 max-w-md">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Recoverable Configuration */}
        <RecoverableConfigForm form={form} />

        {/* Computer Expiration */}
        <div className="border rounded-lg">
          <ComputerExpirationConfig form={form} />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={!isSaveButtonEnabled()}
            className="w-40 whitespace-nowrap"
          >
            {isUpdating ? <LoaderSpinner /> : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

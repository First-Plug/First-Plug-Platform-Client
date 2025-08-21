"use client";

import { useForm } from "react-hook-form";
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

export const CompanySettings = () => {
  const { tenantConfig, isLoading, updateConfig, isUpdating } =
    useCompanySettings();

  const form = useForm({
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
            disabled={isUpdating || !form.formState.isDirty}
            className="w-40 whitespace-nowrap"
          >
            {isUpdating ? <LoaderSpinner /> : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

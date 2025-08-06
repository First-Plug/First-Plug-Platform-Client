"use client";

import { useForm } from "react-hook-form";
import { useCompanySettings } from "../hooks/use-company-settings";
import { Button, LoaderSpinner, Form } from "@/shared";
import { RecoverableConfigForm } from "./recoverable-config-form";
import { ComputerExpirationConfig } from "./computer-expiration-config";
import { useEffect } from "react";

export const CompanySettings = () => {
  const { tenantConfig, isLoading, updateConfig, isUpdating } =
    useCompanySettings();

  const form = useForm({
    defaultValues: {
      isRecoverableConfig: {},
      computerExpiration: 2,
    },
  });

  useEffect(() => {
    if (tenantConfig) {
      form.reset({
        isRecoverableConfig: tenantConfig.isRecoverableConfig || {},
        computerExpiration: tenantConfig.computerExpiration || 2,
      });
    }
  }, [tenantConfig, form]);

  const onSubmit = (data: any) => {
    updateConfig({
      isRecoverableConfig: data.isRecoverableConfig,
      computerExpiration: data.computerExpiration,
    });
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
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={tenantConfig?.tenantName || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
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

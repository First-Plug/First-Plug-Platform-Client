"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSecuritySettings } from "../hooks/use-security-settings";
import { Button, LoaderSpinner, Form } from "@/shared";
import { SecurityForm } from "./security-form";
import {
  securitySchema,
  type SecurityFormData,
} from "../schemas/security.schema";

export const SecuritySettings = () => {
  const form = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    mode: "onChange", // Validar en tiempo real
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { changePassword, isChanging } = useSecuritySettings(() => {
    // Reset form after successful password change
    form.reset();
  });

  const onSubmit = (data: SecurityFormData) => {
    changePassword({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Security Form */}
        <SecurityForm form={form} />

        {/* Validation Messages */}
        {!form.formState.isValid && form.formState.isSubmitted && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              Please fix the following issues:
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {form.formState.errors.oldPassword && (
                <li>• {form.formState.errors.oldPassword.message}</li>
              )}
              {form.formState.errors.newPassword && (
                <li>• {form.formState.errors.newPassword.message}</li>
              )}
              {form.formState.errors.confirmPassword && (
                <li>• {form.formState.errors.confirmPassword.message}</li>
              )}
            </ul>
          </div>
        )}

        {/* Change Password Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isChanging || !form.formState.isValid}
            className="w-40 whitespace-nowrap"
          >
            {isChanging ? <LoaderSpinner /> : "Change Password"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

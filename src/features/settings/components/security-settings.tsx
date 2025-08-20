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
import { useSession } from "next-auth/react";

export const SecuritySettings = () => {
  const { data: session } = useSession();
  const accountProvider = session?.user?.accountProvider;
  const isExternalProvider =
    accountProvider === "google" || accountProvider === "azure-ad";

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
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>

      {isExternalProvider ? (
        // Mensaje para usuarios de Google/Microsoft
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Password managed by{" "}
                {accountProvider === "google" ? "Google" : "Microsoft"}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  You signed in with{" "}
                  {accountProvider === "google" ? "Google" : "Microsoft"}, so
                  your password can only be changed from your provider.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Formulario normal para usuarios con credentials
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
      )}
    </div>
  );
};

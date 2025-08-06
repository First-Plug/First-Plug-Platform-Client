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

        {/* Change Password Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={
              isChanging ||
              !form.formState.isValid ||
              !form.watch("oldPassword") ||
              !form.watch("newPassword") ||
              !form.watch("confirmPassword") ||
              form.watch("newPassword") !== form.watch("confirmPassword")
            }
            className="w-40 whitespace-nowrap"
          >
            {isChanging ? <LoaderSpinner /> : "Change Password"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

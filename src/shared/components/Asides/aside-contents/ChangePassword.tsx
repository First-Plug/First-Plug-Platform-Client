"use client";
import { Button, Input, LoaderSpinner } from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { FormControl, FormField, FormItem, FormMessage } from "@/shared";

import { AuthServices } from "@/features/auth";
import { useAlertStore, useAsideStore } from "@/shared";

const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(1),
    newPasswordConfirmation: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "The password must be equal.",
    path: ["newPasswordConfirmation"],
  });
type ChangePassword = z.infer<typeof ChangePasswordSchema>;

export function ChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { setAlert } = useAlertStore();
  const { setAside } = useAsideStore();
  const form = useForm<ChangePassword>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: "all",
    defaultValues: {
      newPassword: "",
      newPasswordConfirmation: "",
      oldPassword: "",
    },
  });

  const onSubmit = async (values: ChangePassword) => {
    setIsLoading(true);
    try {
      await AuthServices.changePassword({
        newPassword: values.newPassword,
        oldPassword: values.oldPassword,
      });
      setAlert("passwordChange");
      setAside(undefined);
    } catch (error) {
      setAlert("ErorPasswordChange");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-between gap-2 h-full"
      >
        <div className="flex flex-col gap-3">
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Current Password"
                    {...field}
                    title="Current Password * "
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="New password"
                    {...field}
                    title="New Password *"
                    type="password"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPasswordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Confirm password"
                    {...field}
                    title="Confirm Password *"
                    type="password"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <section className="bottom-0 absolute flex justify-end items-center py-6 border-t w-5/6 h-[10%]">
          <Button
            variant="primary"
            className="mr-[39px] rounded-lg w-[200px] h-[40px]"
            type="submit"
            disabled={isLoading || !form.formState.isValid}
          >
            Save
          </Button>
        </section>
      </form>
    </FormProvider>
  );
}

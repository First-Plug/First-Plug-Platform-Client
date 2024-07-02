"use client";
import { Button, Input, LoaderSpinner } from "@/common";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useStore } from "@/models";
import { AuthServices } from "@/services";

const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(1),
    newPasswordConfirmation: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "The password must be equal.",
    path: ["newPasswordConfirmation"], // Puedes especificar el campo que debería mostrar el error
  });
type ChangePassword = z.infer<typeof ChangePasswordSchema>;

export function ChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    alerts: { setAlert },
    aside: { setAside },
  } = useStore();
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
      await AuthServices.cahngePassword({
        newPassword: values.newPassword,
        oldPassword: values.oldPassword,
      });
      setAlert("passwordChange");
      setAside(undefined);
    } catch (error) {
      console.log(error);
      setAlert("ErorPasswordChange");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full flex flex-col justify-between gap-2 "
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
        <section className="flex absolute h-[10%] py-6 items-center justify-end border-t  bottom-0 w-5/6">
          <Button
            variant="primary"
            className="mr-[39px] w-[200px] h-[40px] rounded-lg"
            type="submit"
            disabled={isLoading || !form.formState.isValid}
          >
            SAVE
          </Button>
        </section>
      </form>
    </FormProvider>
  );
}

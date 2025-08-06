"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOfficeSettings } from "../hooks/use-office-settings";
import { Button, LoaderSpinner, Form } from "@/shared";
import { OfficeForm } from "./office-form";
import { useEffect } from "react";
import { officeSchema, type OfficeFormData } from "../schemas/office.schema";

export const OfficeSettings = () => {
  const { office, isLoading, updateOffice, isUpdating } = useOfficeSettings();

  const form = useForm<OfficeFormData>({
    resolver: zodResolver(officeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      state: "",
      zipCode: "",
      address: "",
      apartment: "",
    },
  });

  useEffect(() => {
    if (office) {
      form.reset({
        name: office.name || "",
        email: office.email || "",
        phone: office.phone || "",
        country: office.country || "",
        city: office.city || "",
        state: office.state || "",
        zipCode: office.zipCode || "",
        address: office.address || "",
        apartment: office.apartment || "",
      });
    }
  }, [office, form]);

  const onSubmit = (data: OfficeFormData) => {
    updateOffice(data);
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
        <OfficeForm form={form} />

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

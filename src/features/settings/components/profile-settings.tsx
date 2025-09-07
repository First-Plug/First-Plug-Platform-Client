"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button, LoaderSpinner, Form } from "@/shared";
import { useProfileSettings } from "../hooks/use-profile-settings";
import { ProfileForm } from "./profile-form";
import { profileSchema, type ProfileFormData } from "../schemas/profile.schema";

export const ProfileSettings = () => {
  const { profile, isLoading, updateProfile, isUpdating } =
    useProfileSettings();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      personalEmail: "",
      country: "",
      city: "",
      state: "",
      zipCode: "",
      address: "",
      apartment: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        personalEmail: profile.personalEmail || "",
        country: profile.country || "",
        city: profile.city || "",
        state: profile.state || "",
        zipCode: profile.zipCode || "",
        address: profile.address || "",
        apartment: profile.apartment || "",
      });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileFormData) => {
    // Procesar datos para el backend
    const processedData: any = {};

    Object.entries(data).forEach(([key, value]) => {
      if (key === "personalEmail") {
        // Para personalEmail: solo incluir si tiene valor, omitir si está vacío
        if (value && value.trim() !== "") {
          processedData[key] = value.trim();
        }
        // Si está vacío, no incluir el campo (el backend lo interpretará como "borrar")
      } else {
        // Para otros campos: convertir null/undefined a string vacío
        processedData[key] = value ?? "";
      }
    });

    updateProfile(processedData);
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
        {/* Email (readonly) */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
        </div>

        {/* Personal Information Form */}
        <ProfileForm form={form} />

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

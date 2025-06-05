"use client";
import { ImageProfile } from "@/shared";
import { UseFormReturn } from "react-hook-form";
import { SettingsSubForm } from "@/features/settings";

interface CompanyProps {
  form: UseFormReturn;
}
export var CompanyForm = function CompanyForm({ form }: CompanyProps) {
  return (
    <section className="flex flex-col gap-5 p-4 border rounded-md w-1/2">
      <h2 className="font-montserrat font-bold text-black text-xl">User</h2>
      <div className="flex items-center gap-8">
        <ImageProfile size={150} />
        <div className="flex flex-col gap-4 w-3/4">
          <SettingsSubForm form={form} keyValue="tenantName" />
          <SettingsSubForm form={form} keyValue="phone" />
        </div>
      </div>
    </section>
  );
};

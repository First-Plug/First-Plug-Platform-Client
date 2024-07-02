"use client";
import { ImgPorfile } from "@/common";
import { UseFormReturn } from "react-hook-form";
import { SettingsSubForm } from "@/app/home/settings/SettingsSubForm";

interface CompanyProps {
  form: UseFormReturn;
}
export var CompanyForm = function CompanyForm({ form }: CompanyProps) {
  return (
    <section className="w-1/2 flex flex-col gap-5  border rounded-md p-4 ">
      <h2 className="text-xl font-montserrat font-bold text-black">User</h2>
      <div className="flex gap-8 items-center">
        <ImgPorfile size={150} />
        <div className="w-3/4 flex flex-col gap-4">
          <SettingsSubForm form={form} keyValue="tenantName" />
          <SettingsSubForm form={form} keyValue="phone" />
        </div>
      </div>
    </section>
  );
};

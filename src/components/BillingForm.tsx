"use client";
import { observer } from "mobx-react-lite";
import { FormInput, Card } from "./";
import fields from "../features/members/components/AddMember/JSON/shipmentdata.json";
import { useStore } from "@/models";
import { BarLoader } from "@/shared";
import { UseFormReturn } from "react-hook-form";
import { SettingsSubForm } from "@/features/settings";
interface Props {
  form: UseFormReturn;
}
export var BillingForm = observer(function BillingForm({ form }: Props) {
  const {
    user: { user },
  } = useStore();

  return user ? (
    <section className="flex flex-col gap-5 p-4 border rounded-md w-full">
      <h2 className="font-montserrat font-bold text-black text-xl">
        Company Information
      </h2>
      <div className="gap-4 grid grid-cols-4">
        <SettingsSubForm form={form} keyValue="country" />
        <SettingsSubForm form={form} keyValue="city" />
        <SettingsSubForm form={form} keyValue="state" />
        <SettingsSubForm form={form} keyValue="zipCode" />
        <SettingsSubForm form={form} keyValue="address" />
        <SettingsSubForm form={form} keyValue="apartment" />
      </div>
    </section>
  ) : (
    <BarLoader />
  );
});

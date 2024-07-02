"use client";
import { observer } from "mobx-react-lite";
import { FormInput, Card } from "./";
import fields from "./AddMember/JSON/shipmentdata.json";
import { useStore } from "@/models";
import { BarLoader } from "./Loader/BarLoader";
import { UseFormReturn } from "react-hook-form";
import { SettingsSubForm } from "@/app/home/settings/SettingsSubForm";
interface Props {
  form: UseFormReturn;
}
export var BillingForm = observer(function BillingForm({ form }: Props) {
  const {
    user: { user },
  } = useStore();

  return user ? (
    <section className="w-full flex flex-col gap-5  border rounded-md p-4  ">
      <h2 className="text-xl font-montserrat font-bold text-black">
        Billing Information
      </h2>
      <div className="grid grid-cols-4 gap-4">
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

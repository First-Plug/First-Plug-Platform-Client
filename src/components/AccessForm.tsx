"use client";
import { Button, Input } from "@/common";
import { SettingsSubForm } from "@/app/home/settings/SettingsSubForm";
import { UseFormReturn } from "react-hook-form";
import { useStore } from "@/models";

interface Props {
  form: UseFormReturn;
}
export var AccessForm = function AccessForm({ form }: Props) {
  const {
    aside: { setAside },
  } = useStore();
  return (
    <section className="w-1/2 flex flex-col gap-5  border rounded-md p-4 ">
      <h2 className="text-xl font-montserrat font-bold text-black">Access</h2>
      <SettingsSubForm form={form} keyValue="email" />

      <div className="flex items-center gap-8  h-24">
        <Button
          type="button"
          variant="secondary"
          className="rounded-xs"
          onClick={() => setAside("ChangePassword")}
        >
          Change Password
        </Button>
      </div>
    </section>
  );
};

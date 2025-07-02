"use client";
import { Button } from "@/shared";
import { SettingsSubForm } from "@/features/settings";
import { UseFormReturn } from "react-hook-form";
import { useAsideStore } from "@/shared";
import { useSession } from "next-auth/react";

interface Props {
  form: UseFormReturn;
}
export const AccessForm = ({ form }: Props) => {
  const { setAside } = useAsideStore();
  const {
    data: { user },
  } = useSession();
  return (
    <section className="flex flex-col gap-5 p-4 border rounded-md w-1/2">
      <h2 className="font-montserrat font-bold text-black text-xl">Access</h2>
      <SettingsSubForm form={form} keyValue="email" />

      <div className="flex items-center gap-8 h-24">
        <Button
          type="button"
          variant="secondary"
          className="rounded-xs"
          disabled={user.accountProvider !== "credentials"}
          onClick={() => setAside("ChangePassword")}
        >
          Change Password
        </Button>
      </div>
    </section>
  );
};

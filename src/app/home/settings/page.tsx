"use client";

import { PageLayout, BarLoader } from "@/shared";
import { SettingsForm } from "@/features/settings";
import { useSession } from "next-auth/react";

export default function Settings() {
  const {
    data: { user },
  } = useSession();

  return (
    <PageLayout>
      {!user ? (
        <BarLoader />
      ) : (
        <section className="flex flex-col gap-2 h-full">
          <SettingsForm />
        </section>
      )}
    </PageLayout>
  );
}

"use client";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models";

import { PageLayout, BarLoader } from "@/shared";
import { SettingsForm } from "@/features/settings";

export default observer(function Settings() {
  const {
    user: { user },
  } = useStore();

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
});

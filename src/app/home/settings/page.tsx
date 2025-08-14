"use client";

import { PageLayout, BarLoader } from "@/shared";
import { SettingsLayout } from "@/features/settings";
import { useSession } from "next-auth/react";

export default function Settings() {
  const {
    data: { user },
  } = useSession();

  return <PageLayout>{!user ? <BarLoader /> : <SettingsLayout />}</PageLayout>;
}

"use client";

import { PageLayout, PageLoader } from "@/shared";
import {
  Widgets,
  DashboardLayout,
  useSortedWidgets,
  useFetchDashboard,
} from "@/features/dashboard";

export default function Dashboard() {
  const { isLoading, members, assets, activityLatest, user } =
    useFetchDashboard();
  const sortedWidgets = useSortedWidgets(user?.widgets ?? null);

  if (isLoading || !user) return <PageLoader />;

  // Asegurar que el usuario tenga todas las propiedades requeridas
  const userWithDefaults = {
    ...user,
    name:
      user.name ||
      `${(user as any).firstName || ""} ${
        (user as any).lastName || ""
      }`.trim() ||
      user.email ||
      "User",
    email: user.email || "",
    accountProvider: user.accountProvider || ("credentials" as const),
    isRecoverableConfig: user.isRecoverableConfig || {},
    widgets: user.widgets || [],
  };

  return (
    <PageLayout>
      <DashboardLayout>
        <Widgets
          sortedWidgets={sortedWidgets}
          assets={assets}
          user={userWithDefaults}
          members={members}
          activityLatest={activityLatest}
        />
      </DashboardLayout>
    </PageLayout>
  );
}

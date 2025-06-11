"use client";

import { PageLayout, PageLoader } from "@/shared";

import {
  Widgets,
  DashboardLayout,
  useSortedWidgets,
  useFetchDashboard,
} from "@/features/dashboard";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const {
    data: { user },
  } = useSession();

  const { isLoading, members, assets, activityLatest } = useFetchDashboard();

  const sortedWidgets = useSortedWidgets(user?.widgets ?? null);

  if (isLoading || !user) return <PageLoader />;

  return (
    <PageLayout>
      <DashboardLayout>
        <Widgets
          sortedWidgets={sortedWidgets}
          assets={assets}
          user={user}
          members={members}
          activityLatest={activityLatest}
        />
      </DashboardLayout>
    </PageLayout>
  );
}

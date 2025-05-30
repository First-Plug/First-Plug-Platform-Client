"use client";

import { observer } from "mobx-react-lite";
import { useStore } from "@/models";

import { PageLayout, PageLoader } from "@/shared";

import {
  Widgets,
  DashboardLayout,
  useSortedWidgets,
  useFetchDashboard,
} from "@/features/dashboard";

export default observer(function Dashboard() {
  const {
    user: { user },
  } = useStore();

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
});

"use client";

import { PageLayout } from "@/shared";

import { HistoryTable } from "@/features/activity";

export default function ActionHistoryPage() {
  return (
    <PageLayout>
      <HistoryTable />
    </PageLayout>
  );
}

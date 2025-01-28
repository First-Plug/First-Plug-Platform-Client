"use client";
import { useEffect } from "react";

import { PageLayout } from "@/common";
import { setAuthInterceptor } from "@/config/axios.config";

import HistoryTable from "@/action-history/components/table/HistoryTable";

export default function ActionHistoryPage() {
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      setAuthInterceptor(token);
    }
  }, []);

  return (
    <PageLayout>
      <HistoryTable />
    </PageLayout>
  );
}

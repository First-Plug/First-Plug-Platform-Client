"use client";
import { useEffect } from "react";

import { PageLayout } from "@/common";
import { setAuthInterceptor } from "@/config/axios.config";

import HistoryTable from "@/action-history/components/table/HistoryTable";
import { FilterResetProvider } from "@/components/Tables/Filters/FilterResetContext";

export default function ActionHistoryPage() {
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      setAuthInterceptor(token);
    }
  }, []);

  return (
    <PageLayout>
      <FilterResetProvider>
        <HistoryTable />
      </FilterResetProvider>
    </PageLayout>
  );
}

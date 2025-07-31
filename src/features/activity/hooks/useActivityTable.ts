"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { createFilterStore, usePagination } from "@/features/fp-tables";
import { useFetchLatestActivity } from "./useFetchLatestActivity";
import { endOfDay, format, parseISO, startOfDay, subDays } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";

const useActivityTableFilterStore = createFilterStore();

export function useActivityTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activityId = searchParams.get("activityId");

  const startParam = searchParams.get("startDate");
  const endParam = searchParams.get("endDate");

  const [selectedDates, setSelectedDates] = useState<{
    startDate: Date;
    endDate: Date;
  }>(() => {
    const defaultStart = startOfDay(subDays(new Date(), 6));
    const defaultEnd = endOfDay(new Date());

    const parsedStart = startParam
      ? parseISO(`${startParam}T00:00:00`)
      : defaultStart;
    const parsedEnd = endParam ? parseISO(`${endParam}T23:59:59`) : defaultEnd;

    return {
      startDate: parsedStart,
      endDate: parsedEnd,
    };
  });

  useEffect(() => {
    const defaultStart = startOfDay(subDays(new Date(), 6));
    const defaultEnd = endOfDay(new Date());

    const parsedStart = startParam
      ? parseISO(`${startParam}T00:00:00`)
      : defaultStart;
    const parsedEnd = endParam ? parseISO(`${endParam}T23:59:59`) : defaultEnd;

    setSelectedDates({
      startDate: parsedStart,
      endDate: parsedEnd,
    });
  }, [startParam, endParam]);

  const handleDateChange = (dates: { startDate: Date; endDate: Date }) => {
    setSelectedDates(dates);
    const params = new URLSearchParams(searchParams.toString());
    params.set("startDate", format(dates.startDate, "yyyy-MM-dd"));
    params.set("endDate", format(dates.endDate, "yyyy-MM-dd"));
    router.replace(`?${params.toString()}`);
  };

  const {
    pageIndex,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetToFirstPage,
    tableContainerRef,
  } = usePagination({
    useFilterStore: useActivityTableFilterStore,
    defaultPageSize: 10,
    pageSizes: [10, 25, 50],
  });

  const currentPage = pageIndex + 1;

  const { data, isLoading } = useFetchLatestActivity(
    currentPage,
    pageSize,
    selectedDates
  );

  const tableData = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  useEffect(() => {
    if (activityId && currentPage !== 1) {
      resetToFirstPage();
    }
  }, [activityId, currentPage, resetToFirstPage]);

  useEffect(() => {
    if (activityId && tableData.length > 0 && currentPage === 1) {
      const activityExists = tableData.some(
        (item: any) => item._id === activityId
      );

      if (activityExists) {
        const expandedRows: Record<string, boolean> = {};
        expandedRows[activityId] = true;
        useActivityTableFilterStore.getState().setExpandedRows(expandedRows);

        const params = new URLSearchParams(searchParams.toString());
        params.delete("activityId");
        router.replace(`?${params.toString()}`);
      }
    }
  }, [activityId, tableData, currentPage, searchParams, router]);

  const handleClearAllFilters = () => {
    useActivityTableFilterStore.getState().clearFilters();
  };

  return {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    tableData,
    totalCount,
    isLoading,
    selectedDates,
    setSelectedDates: handleDateChange,
    tableContainerRef,
    useActivityTableFilterStore,
    activityId,
  };
}

"use client";

import { useMemo, useEffect, useRef } from "react";
import { createFilterStore, usePagination } from "@/features/fp-tables";
import { useFetchLatestActivity } from "./useFetchLatestActivity";
import { useSearchParams, useRouter } from "next/navigation";
import { useDateFilterStore } from "../store/dateFilter.store";

const useActivityTableFilterStore = createFilterStore();

export function useActivityTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activityId = searchParams.get("activityId");

  const { selectedDates, setSelectedDates } = useDateFilterStore();
  const previousDatesRef = useRef(selectedDates);

  const handleDateChange = (dates: { startDate: Date; endDate: Date }) => {
    setSelectedDates(dates);
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

  // Resetear a la página 1 solo cuando las fechas cambian por acción del usuario
  useEffect(() => {
    const currentDates = {
      startDate: selectedDates.startDate,
      endDate: selectedDates.endDate,
    };

    const previousDates = previousDatesRef.current;

    // Solo resetear si las fechas realmente cambiaron (no por navegación)
    if (
      previousDates &&
      (previousDates.startDate.getTime() !== currentDates.startDate.getTime() ||
        previousDates.endDate.getTime() !== currentDates.endDate.getTime()) &&
      pageIndex > 0
    ) {
      resetToFirstPage();
    }

    // Actualizar la referencia
    previousDatesRef.current = currentDates;
  }, [
    selectedDates.startDate,
    selectedDates.endDate,
    pageIndex,
    resetToFirstPage,
  ]);

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
    tableContainerRef,
    useActivityTableFilterStore,
    activityId,
  };
}

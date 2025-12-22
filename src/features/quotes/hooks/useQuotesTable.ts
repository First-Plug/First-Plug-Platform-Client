"use client";

import { useMemo, useEffect, useRef } from "react";
import { startOfDay, endOfDay } from "date-fns";
import { createFilterStore } from "@/features/fp-tables/store/createFilterStore";
import { usePagination } from "@/features/fp-tables";
import { useFetchQuotesHistory } from "./useFetchQuotesHistory";
import { useDateFilterStore } from "@/features/activity/store/dateFilter.store";

const useQuotesTableFilterStore = createFilterStore();

export function useQuotesTable() {
  const { selectedDates, setSelectedDates, resetToDefault } =
    useDateFilterStore();
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
    useFilterStore: useQuotesTableFilterStore,
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

  // Usar startOfDay y endOfDay para incluir todos los registros del día
  const startDate = startOfDay(selectedDates.startDate).toISOString();
  const endDate = endOfDay(selectedDates.endDate).toISOString();

  const { data, isLoading } = useFetchQuotesHistory(
    currentPage,
    pageSize,
    startDate,
    endDate
  );

  const tableData = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  const handleClearAllFilters = () => {
    useQuotesTableFilterStore.getState().clearFilters();
    resetToDefault();
    resetToFirstPage();
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
    useQuotesTableFilterStore,
  };
}

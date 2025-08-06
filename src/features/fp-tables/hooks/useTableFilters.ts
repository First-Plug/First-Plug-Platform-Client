"use client";

import { useMemo } from "react";

export interface UseTableFiltersOptions {
  tableId: string;
  useFilterStore: any;
}

export const useTableFilters = (options: UseTableFiltersOptions) => {
  const { tableId, useFilterStore } = options;

  const getFilters = useFilterStore((s: any) => s.getFilters);
  const getPageIndex = useFilterStore((s: any) => s.getPageIndex);
  const getPageSize = useFilterStore((s: any) => s.getPageSize);
  const setFilter = useFilterStore((s: any) => s.setFilter);
  const setPageIndex = useFilterStore((s: any) => s.setPageIndex);
  const setPageSize = useFilterStore((s: any) => s.setPageSize);
  const clearFilters = useFilterStore((s: any) => s.clearFilters);

  const filters = useMemo(() => getFilters(tableId), [getFilters, tableId]);
  const pageIndex = useMemo(
    () => getPageIndex(tableId),
    [getPageIndex, tableId]
  );
  const pageSize = useMemo(() => getPageSize(tableId), [getPageSize, tableId]);

  const handleSetFilter = (column: string, values: string[]) => {
    setFilter(tableId, column, values);
  };

  const handleSetPageIndex = (newPageIndex: number) => {
    setPageIndex(tableId, newPageIndex);
  };

  const handleSetPageSize = (newPageSize: number) => {
    setPageSize(tableId, newPageSize);
  };

  const handleClearFilters = () => {
    clearFilters(tableId);
  };

  return {
    filters,
    pageIndex,
    pageSize,
    setFilter: handleSetFilter,
    setPageIndex: handleSetPageIndex,
    setPageSize: handleSetPageSize,
    clearFilters: handleClearFilters,
  };
};

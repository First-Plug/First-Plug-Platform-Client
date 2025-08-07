"use client";
import { useMemo, useEffect, useRef } from "react";
import { createFilterStore, usePagination } from "@/features/fp-tables";
import { LogisticOrder } from "../interfaces/logistics";
import { mockLogisticOrders } from "../data/mockData";

const useLogisticsTableFilterStore = createFilterStore();

export const useLogisticsTable = () => {
  const filters = useLogisticsTableFilterStore((s) => s.filters);
  const setOnFiltersChange = useLogisticsTableFilterStore(
    (s) => s.setOnFiltersChange
  );
  const collapseAllRows = useLogisticsTableFilterStore(
    (s) => s.collapseAllRows
  );

  const {
    pageIndex,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetToFirstPage,
    tableContainerRef,
  } = usePagination({
    useFilterStore: useLogisticsTableFilterStore,
    defaultPageSize: 10,
    pageSizes: [10, 25, 50, 100],
  });

  useEffect(() => {
    setOnFiltersChange(() => {
      resetToFirstPage();
    });
  }, [setOnFiltersChange, resetToFirstPage]);

  // Aplicar filtros a los datos
  const filteredData = useMemo(() => {
    return mockLogisticOrders.filter((order) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "tenant":
            return filterValues.some((value) => order.tenant === value);
          case "orderId":
            return filterValues.some((value) => order.orderId === value);
          case "orderDate":
            return filterValues.some((value) => order.orderDate === value);
          case "quantity":
            return filterValues.some(
              (value) => order.quantity.toString() === value
            );
          case "price":
            return filterValues.some((value) => order.price === value);
          case "shipmentType":
            return filterValues.some((value) => order.shipmentType === value);
          case "shipmentStatus":
            return filterValues.some((value) => order.shipmentStatus === value);
          default:
            return true;
        }
      });
    });
  }, [filters]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  const handleClearAllFilters = () => {
    useLogisticsTableFilterStore.getState().clearFilters();
    resetToFirstPage();
  };

  return {
    data: filteredData,
    paginatedData,
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    useLogisticsTableFilterStore,
    tableContainerRef,
    isLoading: false, // Mock data, siempre false
  };
};

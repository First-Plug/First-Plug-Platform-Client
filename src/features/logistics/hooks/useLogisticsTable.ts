"use client";
import { useMemo, useEffect, useRef } from "react";
import { createFilterStore } from "@/features/fp-tables/store/createFilterStore";
import { usePagination } from "@/features/fp-tables";
import { LogisticOrder } from "../interfaces/logistics";

const useLogisticsTableFilterStore = createFilterStore();

export const useLogisticsTable = (
  shipments: LogisticOrder[] = [],
  isLoading: boolean = false
) => {
  // Validación adicional para asegurar que shipments sea un array
  const validShipments = useMemo(() => {
    if (!shipments || !Array.isArray(shipments)) {
      console.warn("useLogisticsTable received invalid shipments:", shipments);
      return [];
    }
    return shipments;
  }, [shipments]);

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
    if (isLoading || !validShipments) return [];

    return validShipments.filter((order) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "tenant":
            return filterValues.some((value) => order.tenant === value);
          case "order_id":
            return filterValues.some((value) => order.order_id === value);
          case "order_date":
            return filterValues.some((value) => order.order_date === value);
          case "createdAt":
            return filterValues.some(
              (value) =>
                new Date(order.createdAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }) === value
            );
          case "quantity_products":
            return filterValues.some(
              (value) => order.quantity_products.toString() === value
            );
          case "price":
            // Verificar si amount es null antes de llamar toString()
            if (
              order.price.amount === null ||
              order.price.amount === undefined
            ) {
              // Si no hay amount, comparar solo con currencyCode (ej: "TBC")
              return filterValues.some(
                (value) => order.price.currencyCode === value
              );
            }
            // Si tiene amount, comparar con el conjunto "currency amount" (ej: "USD 100")
            const priceString = `${order.price.currencyCode} ${order.price.amount}`;
            return filterValues.some((value) => priceString === value);
          case "shipment_type":
            return filterValues.some((value) => order.shipment_type === value);
          case "shipment_status":
            return filterValues.some(
              (value) => order.shipment_status === value
            );
          case "updatedAt":
            return filterValues.some(
              (value) => new Date(order.updatedAt).toISOString() === value
            );
          default:
            return true;
        }
      });
    });
  }, [filters, validShipments, isLoading]);

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
    isLoading,
  };
};

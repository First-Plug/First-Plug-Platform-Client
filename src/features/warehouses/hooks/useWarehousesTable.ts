import { useMemo, useEffect } from "react";
import { createFilterStore } from "@/features/fp-tables/store/createFilterStore";
import { usePagination } from "@/features/fp-tables";
import type { WarehouseDetails } from "../interfaces/warehouse.interface";

const useWarehousesTableFilterStore = createFilterStore();

export { useWarehousesTableFilterStore };

export function useWarehousesTable() {
  // Mock data - en el futuro esto vendrá de una API
  const warehousesData: WarehouseDetails[] = [
    {
      id: "1",
      name: "Asia Pacific Center",
      country: "Singapore",
      partnerType: "temporary",
      isActive: false,
      tenantCount: 4,
      totalProducts: 2100,
      state: "Singapore",
      city: "Singapore",
      zipCode: "123456",
      address: "123456",
      apartment: "123456",
      phoneContact: "123456",
      email: "123456",
      contactChannel: "123456",
      contactPerson: "123456",
      additionalInfo: "123456",
    },
    {
      id: "2",
      name: "Central Distribution Center",
      country: "United States",
      partnerType: "own",
      isActive: true,
      tenantCount: 3,
      totalProducts: 1250,
      state: "United States",
      city: "United States",
      zipCode: "123456",
      address: "123456",
      apartment: "123456",
      phoneContact: "123456",
      email: "123456",
      contactChannel: "123456",
      contactPerson: "123456",
      additionalInfo: "123456",
    },
    {
      id: "3",
      name: "European Logistics Hub",
      country: "Germany",
      partnerType: "partner",
      isActive: true,
      tenantCount: 2,
      totalProducts: 850,
      state: "Germany",
      city: "Germany",
      zipCode: "123456",
      address: "123456",
      apartment: "123456",
      phoneContact: "123456",
      email: "123456",
      contactChannel: "123456",
      contactPerson: "123456",
      additionalInfo: "123456",
    },
  ];

  const warehouses = warehousesData;

  const filters = useWarehousesTableFilterStore((s) => s.filters);
  const setOnFiltersChange = useWarehousesTableFilterStore(
    (s) => s.setOnFiltersChange
  );

  const {
    pageIndex,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetToFirstPage,
    tableContainerRef,
  } = usePagination({
    useFilterStore: useWarehousesTableFilterStore,
    defaultPageSize: 10,
    pageSizes: [10, 25, 50, 100],
  });

  useEffect(() => {
    setOnFiltersChange(() => {
      resetToFirstPage();
    });
  }, [setOnFiltersChange, resetToFirstPage]);

  const filteredWarehouses = useMemo(() => {
    if (
      Object.values(filters).every((filterValues) => filterValues.length === 0)
    ) {
      return warehouses;
    }

    const filtered = warehouses.filter((warehouse) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "name":
            return filterValues.some((value) =>
              warehouse.name.toLowerCase().includes(value.toLowerCase())
            );
          case "country":
            return filterValues.some((value) =>
              warehouse.country.toLowerCase().includes(value.toLowerCase())
            );
          case "partnerType":
            return filterValues.some(
              (value) => warehouse.partnerType === value
            );
          case "isActive":
            return filterValues.some(
              (value) => warehouse.isActive.toString() === value
            );
          case "tenantCount":
            return filterValues.some((count: string) => {
              return warehouse.tenantCount.toString() === count;
            });
          case "totalProducts":
            return filterValues.some((products: string) => {
              return warehouse.totalProducts.toString() === products;
            });
          default:
            return true;
        }
      });
    });

    return filtered;
  }, [warehouses, filters]);

  const totalPages = Math.ceil(filteredWarehouses.length / pageSize);
  const paginatedWarehouses = filteredWarehouses.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  const handleClearAllFilters = () => {
    useWarehousesTableFilterStore.getState().clearFilters();
    resetToFirstPage();
  };

  return {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    filteredWarehouses,
    paginatedWarehouses,
    tableContainerRef,
    useWarehousesTableFilterStore,
    filteredDataForColumns: filteredWarehouses,
    isLoading: false,
    error: null,
  };
}

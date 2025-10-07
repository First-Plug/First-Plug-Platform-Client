import { useMemo, useEffect } from "react";
import { createFilterStore } from "@/features/fp-tables/store/createFilterStore";
import { usePagination } from "@/features/fp-tables";
import type { WarehouseDetails } from "../interfaces/warehouse.interface";
import { useFetchWarehouses } from "./useFetchWarehouses";
import type { WarehouseAPIData } from "../services/warehouses.services";

const useWarehousesTableFilterStore = createFilterStore();

export { useWarehousesTableFilterStore };

// Transform API data to WarehouseDetails format
function transformWarehouseData(
  apiData: WarehouseAPIData[]
): WarehouseDetails[] {
  return apiData.map((warehouse) => ({
    id: warehouse.warehouseId,
    name: warehouse.warehouseName,
    country: warehouse.country,
    countryCode: warehouse.countryCode,
    partnerType: warehouse.partnerType,
    isActive: warehouse.isActive,
    tenantCount: warehouse.distinctTenants,
    totalProducts: warehouse.totalProducts,
    computers: warehouse.computers,
    otherProducts: warehouse.otherProducts,
    distinctTenants: warehouse.distinctTenants,
    hasStoredProducts: warehouse.hasStoredProducts,
    tenants: warehouse.tenants.map((tenant) => ({
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName,
      companyName: tenant.companyName,
      totalProducts: tenant.totalProducts,
      computers: tenant.computers,
      otherProducts: tenant.otherProducts,
    })),
  }));
}

export function useWarehousesTable() {
  const { data: warehousesDataAPI, isLoading, error } = useFetchWarehouses();

  const warehouses = useMemo(() => {
    if (!warehousesDataAPI) return [];
    return transformWarehouseData(warehousesDataAPI);
  }, [warehousesDataAPI]);

  const filters = useWarehousesTableFilterStore((s) => s.filters);
  const setOnFiltersChange = useWarehousesTableFilterStore(
    (s) => s.setOnFiltersChange
  );
  const setFilter = useWarehousesTableFilterStore((s) => s.setFilter);

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

  // Opciones de tenants para el filtro superior
  const tenantFilterOptions = useMemo(() => {
    const allTenantNames = (warehouses || [])
      .flatMap((w) => w.tenants?.map((t) => t.tenantName) || [])
      .filter(Boolean) as string[];
    const unique = Array.from(new Set(allTenantNames)).sort();
    return unique.map((name) => ({ label: name, value: name }));
  }, [warehouses]);

  const selectedTenantName = useMemo(() => {
    const values = filters["tenantName"] || [];
    return values[0] || "";
  }, [filters]);

  const handleSetTenantFilter = (value?: string) => {
    setFilter("tenantName", value ? [value] : []);
  };

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
          case "countryCode":
            return filterValues.some((value) =>
              warehouse.countryCode.toLowerCase().includes(value.toLowerCase())
            );
          case "partnerType":
            return filterValues.some(
              (value) => warehouse.partnerType === value
            );
          case "isActive":
            return filterValues.some(
              (value) => warehouse.isActive.toString() === value
            );
          case "tenantName":
            return filterValues.some((value) =>
              (warehouse.tenants || []).some((t) => t.tenantName === value)
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
    tenantFilterOptions,
    selectedTenantName,
    handleSetTenantFilter,
    isLoading,
    error,
  };
}

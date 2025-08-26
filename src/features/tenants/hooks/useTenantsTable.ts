import { useMemo, useEffect } from "react";
import { createFilterStore } from "@/features/fp-tables/store/createFilterStore";
import { usePagination } from "@/features/fp-tables";
import { useFetchTenants } from "./useFetchTenants";

const useTenantsTableFilterStore = createFilterStore();

export { useTenantsTableFilterStore };

export function useTenantsTable() {
  // Fetch real data from API
  const { data: apiTenants, isLoading, error } = useFetchTenants();

  // Process API data when available
  const processedTenants = useMemo(() => {
    if (!apiTenants) return []; // Return empty array while loading

    console.log("🔄 Processing tenants data:", apiTenants);
    return apiTenants.map((tenant) => ({
      ...tenant,
      // Use the numberOfActiveUsers calculated by backend (already filtered for active users only)
      numberOfActiveUsers: tenant.numberOfActiveUsers || 0,
    }));
  }, [apiTenants]);

  // Use processedTenants directly instead of useState
  const tenants = processedTenants;

  console.log("📊 Final tenants for table:", tenants.length, tenants);

  const filters = useTenantsTableFilterStore((s) => s.filters);
  const setOnFiltersChange = useTenantsTableFilterStore(
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
    useFilterStore: useTenantsTableFilterStore,
    defaultPageSize: 10,
    pageSizes: [10, 25, 50, 100],
  });

  useEffect(() => {
    setOnFiltersChange(() => {
      resetToFirstPage();
    });
  }, [setOnFiltersChange, resetToFirstPage]);

  const filteredTenants = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return tenants;
    }

    const filtered = tenants.filter((tenant) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "tenantName":
            return filterValues.some((value) => tenant.tenantName === value);
          case "name":
            return filterValues.some((value) => tenant.name === value);

          case "numberOfActiveUsers":
            return filterValues.some((count: string) => {
              return tenant.numberOfActiveUsers.toString() === count;
            });

          default:
            return true;
        }
      });
    });

    return filtered;
  }, [tenants, filters]);

  const totalPages = Math.ceil(filteredTenants.length / pageSize);
  const paginatedTenants = filteredTenants.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  const handleClearAllFilters = () => {
    useTenantsTableFilterStore.getState().clearFilters();
    resetToFirstPage();
  };

  return {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    filteredTenants,
    paginatedTenants,
    tableContainerRef,
    useTenantsTableFilterStore,
    filteredDataForColumns: filteredTenants,
    isLoading,
    error,
  };
}

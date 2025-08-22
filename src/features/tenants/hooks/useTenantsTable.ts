import { useState, useMemo, useEffect } from "react";
import { mockTenants } from "../data/mockData";
import { Tenant } from "../interfaces/tenant.interface";
import { createFilterStore } from "@/features/fp-tables/store/createFilterStore";
import { usePagination } from "@/features/fp-tables";

const useTenantsTableFilterStore = createFilterStore();

export { useTenantsTableFilterStore };

export function useTenantsTable() {
  const processedTenants = useMemo(() => {
    return mockTenants.map((tenant) => ({
      ...tenant,
      numberOfActiveUsers: tenant.users.length,
    }));
  }, []);

  const [tenants, setTenants] = useState<Tenant[]>(processedTenants);

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
  };
}

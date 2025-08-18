"use client";

import { useMemo, useEffect } from "react";
import { createFilterStore, usePagination } from "@/features/fp-tables";

import { mockAssignedUsers } from "../data/mockData";
import { useQuery } from "@tanstack/react-query";

const useAssignedUsersTableFilterStore = createFilterStore();

export { useAssignedUsersTableFilterStore };

export function useAssignedUsersTable() {
  const { data: users = mockAssignedUsers } = useQuery({
    queryKey: ["assignedUsers"],
    queryFn: () => mockAssignedUsers,
    initialData: mockAssignedUsers,
  });

  const filters = useAssignedUsersTableFilterStore((s) => s.filters);
  const setOnFiltersChange = useAssignedUsersTableFilterStore(
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
    useFilterStore: useAssignedUsersTableFilterStore,
    defaultPageSize: 10,
    pageSizes: [10, 25, 50, 100],
  });

  useEffect(() => {
    setOnFiltersChange(() => {
      resetToFirstPage();
    });
  }, [setOnFiltersChange, resetToFirstPage]);

  const filteredUsers = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return users;
    }

    const filtered = users.filter((user) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "assignedTenant":
            return filterValues.some((value) => {
              if (value === "Internal FP") {
                return user.assignedTenant === "";
              }
              return user.assignedTenant === value;
            });

          case "name":
            return filterValues.some((value) =>
              user.name.toLowerCase().includes(value.toLowerCase())
            );

          case "email":
            return filterValues.some((value) =>
              user.email.toLowerCase().includes(value.toLowerCase())
            );

          case "role":
            return filterValues.some((value) => user.role === value);

          default:
            return true;
        }
      });
    });

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [users, filters]);

  const paginatedUsers = useMemo(() => {
    if (!filteredUsers) return [];

    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, pageIndex, pageSize]);

  const totalPages = useMemo(() => {
    if (!filteredUsers) return 1;
    return Math.ceil(filteredUsers.length / pageSize);
  }, [filteredUsers, pageSize]);

  const handleClearAllFilters = () => {
    useAssignedUsersTableFilterStore.getState().clearFilters();
  };

  return {
    pageIndex,
    pageSize,
    totalPages,

    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,

    filteredUsers,
    paginatedUsers,
    tableContainerRef,
    useAssignedUsersTableFilterStore,
  };
}

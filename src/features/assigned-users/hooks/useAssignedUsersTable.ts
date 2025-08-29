"use client";

import { useMemo, useEffect } from "react";
import { createFilterStore } from "@/features/fp-tables/store/createFilterStore";
import { usePagination } from "@/features/fp-tables";
import { useFetchAssignedUsers } from "./useFetchAssignedUsers";
import type { AssignedUser } from "../interfaces/assignedUser.interface";

const useAssignedUsersTableFilterStore = createFilterStore();

export { useAssignedUsersTableFilterStore };

export function useAssignedUsersTable() {
  // Fetch real data from API
  const { data: apiUsers } = useFetchAssignedUsers();

  // Process API data when available
  const users = useMemo(() => {
    if (!apiUsers) return [];

    console.log("🔄 Processing assigned users data:", apiUsers);
    // Transform backend data to match frontend interface
    return apiUsers.map((user: AssignedUser) => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      assignedTenant: user.tenantId?.name || "Internal FP",
      tenantName: user.tenantId?.tenantName || "N/A",
      tenantId: user.tenantId?._id,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }));
  }, [apiUsers]);

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

  const INTERNAL_LABEL = "Internal FP";
  const TENANTNAME_EMPTY_LABEL = "N/A";

  const filteredUsers = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return users;
    }

    const filtered = users.filter((user) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "assignedTenant":
            return filterValues.some((val: string) => {
              if (val === INTERNAL_LABEL) return !user.tenantId;
              return user.assignedTenant === val;
            });

          case "tenantName": {
            return filterValues.some((val: string) => {
              if (val === TENANTNAME_EMPTY_LABEL) return !user.tenantId;
              return (user.tenantName || TENANTNAME_EMPTY_LABEL) === val;
            });
          }

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

    filteredDataForColumns: filteredUsers,
  };
}

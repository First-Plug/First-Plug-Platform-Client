"use client";

import { useMemo, useEffect } from "react";
import { createFilterStore } from "@/features/fp-tables/store/createFilterStore";
import { usePagination } from "@/features/fp-tables";

import { mockUnassignedUsers } from "../data/mockData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEditableTableData } from "./useEditableTableData";

const useUnassignedUsersTableFilterStore = createFilterStore();

export { useUnassignedUsersTableFilterStore };

export function useUnassignedUsersTable() {
  const { data: users = mockUnassignedUsers } = useQuery({
    queryKey: ["unassignedUsers"],
    queryFn: () => mockUnassignedUsers,
    initialData: mockUnassignedUsers,
  });

  const { editableUsers, updateUserField, resetToInitial } =
    useEditableTableData(users);

  const filters = useUnassignedUsersTableFilterStore((s) => s.filters);
  const setOnFiltersChange = useUnassignedUsersTableFilterStore(
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
    useFilterStore: useUnassignedUsersTableFilterStore,
    defaultPageSize: 10,
    pageSizes: [10, 25, 50, 100],
  });

  useEffect(() => {
    setOnFiltersChange(() => {
      resetToFirstPage();
    });
  }, [setOnFiltersChange, resetToFirstPage]);

  useEffect(() => {
    resetToInitial();
  }, [users, resetToInitial]);

  const filteredUsers = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return editableUsers;
    }

    const filtered = editableUsers.filter((user) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "creationDate":
            const userDate = new Date(user.creationDate).toLocaleDateString(
              "es-ES",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            );
            return filterValues.some((value) => userDate === value);

          case "name":
            return filterValues.some((value) =>
              user.name.toLowerCase().includes(value.toLowerCase())
            );

          case "email":
            return filterValues.some((value) =>
              user.email.toLowerCase().includes(value.toLowerCase())
            );

          case "tenant":
            return filterValues.some((value) => user.tenant === value);

          case "role":
            return filterValues.some((value) => user.role === value);

          default:
            return true;
        }
      });
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.creationDate);
      const dateB = new Date(b.creationDate);
      return dateB.getTime() - dateA.getTime();
    });
  }, [editableUsers, filters]);

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
    useUnassignedUsersTableFilterStore.getState().clearFilters();
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
    updateUserField,
    useUnassignedUsersTableFilterStore,
    // Pasar los datos filtrados para que los filtros se adapten dinámicamente
    filteredDataForColumns: filteredUsers,
  };
}

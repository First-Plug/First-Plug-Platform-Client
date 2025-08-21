"use client";
import React from "react";
import { type Row } from "@tanstack/react-table";
import { createFilterStore } from "@/features/fp-tables";
import { TenantUsersTable, type Tenant } from "@/features/tenants";

const useTenantsSubtableFilterStore = createFilterStore();

export function useTenantsSubtableLogic() {
  const getRowCanExpand = (row: Row<Tenant>) => {
    return row.original.users && row.original.users.length > 0;
  };

  const getRowId = (row: Tenant) => {
    if (!row.users || row.users.length === 0) {
      return undefined;
    }
    return row.id;
  };

  const renderSubComponent = (row: Row<Tenant>) => {
    const tenant = row.original;
    const tableId = getRowId(tenant);

    if (!tableId) return null;

    return (
      <div className="bg-white border-gray-200 border-b w-full">
        <TenantUsersTable
          users={tenant.users}
          useFilterStore={useTenantsSubtableFilterStore}
          tableId={tableId}
        />
      </div>
    );
  };

  const handleClearSubtableFilters = () => {
    useTenantsSubtableFilterStore.getState().clearFiltersForTable("all");
  };

  return {
    getRowCanExpand,
    getRowId,
    renderSubComponent,
    handleClearSubtableFilters,
    useTenantsSubtableFilterStore,
  };
}

"use client";

import React from "react";
import { type Row } from "@tanstack/react-table";
import { createFilterStore } from "@/features/fp-tables/store/createFilterStore";
import { WarehouseDetails } from "../interfaces/warehouse.interface";
import { WarehouseTenantsTable } from "@/features/warehouses/components/WarehouseTenantsTable";

const useWarehousesSubtableFilterStore = createFilterStore();

export function useWarehousesSubtableLogic() {
  const getRowCanExpand = (row: Row<WarehouseDetails>) => {
    const expandedRows =
      useWarehousesSubtableFilterStore.getState().expandedRows;
    return (
      (row.original.tenants && row.original.tenants.length > 0) ||
      expandedRows[row.original.id]
    );
  };

  const getRowId = (row: WarehouseDetails) => {
    if (!row.tenants || row.tenants.length === 0) {
      return undefined;
    }
    return row.id;
  };

  const renderSubComponent = (row: Row<WarehouseDetails>) => {
    const warehouse = row.original;
    const tableId = getRowId(warehouse);

    if (!tableId) return null;

    return (
      <div className="bg-white border-gray-200 border-b w-full">
        <WarehouseTenantsTable
          tenants={warehouse.tenants || []}
          useFilterStore={useWarehousesSubtableFilterStore}
          tableId={tableId}
        />
      </div>
    );
  };

  const handleClearSubtableFilters = () => {
    useWarehousesSubtableFilterStore.getState().clearFiltersForTable("all");
  };

  return {
    getRowCanExpand,
    getRowId,
    renderSubComponent,
    handleClearSubtableFilters,
    useWarehousesSubtableFilterStore,
  };
}

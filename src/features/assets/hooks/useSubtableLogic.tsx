"use client";
import React from "react";
import { type Row } from "@tanstack/react-table";
import { createFilterStore } from "@/features/fp-tables";
import { ProductsDetailsTable, type ProductTable } from "@/features/assets";

const useSubtableFilterStore = createFilterStore();

export function useSubtableLogic() {
  const getRowCanExpand = (row: Row<ProductTable>) => {
    return row.original.products?.[0] && !row.original.products[0].deleted;
  };

  const getRowId = (row: ProductTable) => {
    if (!row.products?.[0]) {
      return undefined; // Esto hará que la tabla ignore esta fila
    }
    return `${row.category}-${row.products[0]._id}`;
  };

  const renderSubComponent = (row: Row<ProductTable>) => {
    // Usar availableProducts si está disponible (cuando onlyAvailable está activado)
    const products =
      row.original.availableProducts ||
      row.original.products.filter(
        (product) => product.status !== "Deprecated"
      );

    // Crear un ID único para esta subtabla basado en la fila
    const tableId = getRowId(row.original);

    return (
      <div className="bg-white border-gray-200 border-b w-full">
        <ProductsDetailsTable
          products={products}
          useFilterStore={useSubtableFilterStore}
          tableId={tableId}
        />
      </div>
    );
  };

  const handleClearSubtableFilters = () => {
    useSubtableFilterStore.getState().clearFiltersForTable("all");
  };

  return {
    getRowCanExpand,
    getRowId,
    renderSubComponent,
    handleClearSubtableFilters,
    useSubtableFilterStore,
  };
}

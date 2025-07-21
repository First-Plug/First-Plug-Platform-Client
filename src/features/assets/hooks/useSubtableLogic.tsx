"use client";
import React from "react";
import { type Row } from "@tanstack/react-table";
import { createFilterStore } from "@/features/fp-tables";
import { ProductsDetailsTable, type ProductTable } from "@/features/assets";

const useSubtableFilterStore = createFilterStore();

export function useSubtableLogic() {
  const getRowCanExpand = (row: Row<ProductTable>) => {
    return row.original.products && row.original.products.length > 0;
  };

  const getRowId = (row: ProductTable) => {
    const firstProduct = row.products[0];
    if (firstProduct) {
      return `${row.category}-${firstProduct._id}`;
    }
    return `${row.category}-${row.products.length}`;
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
      <div className="bg-white w-full">
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

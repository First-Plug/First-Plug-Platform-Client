"use client";

import { useMemo, useEffect, useRef } from "react";
import { createFilterStore, usePagination } from "@/features/fp-tables";
import { type ProductTable } from "../interfaces/product";
import { useProductStore } from "../store/product.store";

const useAssetsTableFilterStore = createFilterStore();

export function useAssetsTable(assets: ProductTable[]) {
  const { onlyAvailable } = useProductStore();
  const prevOnlyAvailableRef = useRef(onlyAvailable);

  const filters = useAssetsTableFilterStore((s) => s.filters);
  const setOnFiltersChange = useAssetsTableFilterStore(
    (s) => s.setOnFiltersChange
  );
  const collapseAllRows = useAssetsTableFilterStore((s) => s.collapseAllRows);

  const {
    pageIndex,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetToFirstPage,
    tableContainerRef,
  } = usePagination({
    useFilterStore: useAssetsTableFilterStore,
    defaultPageSize: 10,
    pageSizes: [10, 25, 50, 100],
  });

  useEffect(() => {
    setOnFiltersChange(() => {
      resetToFirstPage();
    });
  }, [setOnFiltersChange, resetToFirstPage]);

  useEffect(() => {
    if (prevOnlyAvailableRef.current !== onlyAvailable) {
      resetToFirstPage();
      prevOnlyAvailableRef.current = onlyAvailable;
    }
  }, [onlyAvailable, resetToFirstPage]);

  const filteredAssets = useMemo(() => {
    // Primero aplicar filtros de la tabla sobre todos los assets
    const tableFiltered = assets.filter((asset) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "category":
            return filterValues.some((value) => asset.category === value);
          case "name":
            // Usar el primer producto del asset original para el filtro de nombre
            const product = asset.products[0];
            const brand = product.attributes.find(
              (attr) => attr.key === "brand"
            )?.value;
            const model = product.attributes.find(
              (attr) => attr.key === "model"
            )?.value;
            const name = (product.name || "").trim();
            const color =
              product.attributes.find((attr) => attr.key === "color")?.value ||
              "";
            let groupName = "No Data";
            if (product.category === "Merchandising") {
              groupName = color ? `${name} (${color})` : name;
            } else if (brand && model) {
              groupName =
                model === "Other"
                  ? `${brand} Other ${name}`
                  : `${brand} ${model}`;
              groupName = groupName.trim();
            }
            return filterValues.some((value) => groupName === value);
          default:
            return true;
        }
      });
    });

    let finalFiltered = tableFiltered;
    if (onlyAvailable) {
      finalFiltered = tableFiltered
        .map((asset) => {
          const availableProducts = asset.products.filter(
            (product) => product.status === "Available" && !product.deleted
          );

          if (availableProducts.length === 0) return null;

          return {
            ...asset,
            products: availableProducts,
          };
        })
        .filter((asset) => asset !== null) as ProductTable[];
    }

    return finalFiltered;
  }, [assets, filters, onlyAvailable]);

  const paginatedAssets = useMemo(() => {
    if (!filteredAssets) return [];

    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAssets.slice(startIndex, endIndex);
  }, [filteredAssets, pageIndex, pageSize]);

  const totalPages = useMemo(() => {
    if (!filteredAssets) return 1;
    return Math.ceil(filteredAssets.length / pageSize);
  }, [filteredAssets, pageSize]);

  const handleClearAllFilters = () => {
    useAssetsTableFilterStore.getState().clearFilters();
  };

  return {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    filteredAssets,
    paginatedAssets,
    tableContainerRef,
    useAssetsTableFilterStore,
    collapseAllRows,
  };
}

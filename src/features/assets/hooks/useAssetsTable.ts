import { useMemo, useEffect } from "react";
import { createFilterStore, usePagination } from "@/features/fp-tables";
import { ProductTable } from "../interfaces/product";
import { useProductStore } from "../store/product.store";

const useAssetsTableFilterStore = createFilterStore();

export function useAssetsTable(assets: ProductTable[]) {
  const { onlyAvailable } = useProductStore();

  const filters = useAssetsTableFilterStore((s) => s.filters);
  const setOnFiltersChange = useAssetsTableFilterStore(
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
    useFilterStore: useAssetsTableFilterStore,
    defaultPageSize: 10,
    pageSizes: [10, 25, 50, 100],
  });

  useEffect(() => {
    setOnFiltersChange(() => {
      resetToFirstPage();
    });
  }, [setOnFiltersChange, resetToFirstPage]);

  const filteredAssets = useMemo(() => {
    let availableAssets = assets;
    if (onlyAvailable) {
      availableAssets = assets
        .map((asset) => ({
          ...asset,
          products: asset.products.filter(
            (product) => product.status === "Available" && !product.deleted
          ),
        }))
        .filter((asset) => asset.products.length > 0);
    }

    const filtered = availableAssets.filter((asset) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "category":
            return filterValues.some((value) => asset.category === value);
          case "name":
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

    return filtered;
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
  };
}

"use client";

import { ProductsTable } from "@/shared/components/Tables";
import { FilterResetProvider } from "@/shared/components/Tables/Filters/FilterResetContext";
import { ProductTable } from "@/features/assets";

interface DataStockProps {
  assets: ProductTable[];
}

export const DataStock = function DataStock({ assets }: DataStockProps) {
  return (
    <div className="h-full max-h-full">
      <FilterResetProvider>
        <ProductsTable assets={assets} onClearFilters={() => {}} />
      </FilterResetProvider>
    </div>
  );
};

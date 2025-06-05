"use client";

import { ProductsTable } from "@/components/Tables";
import { FilterResetProvider } from "@/components/Tables/Filters/FilterResetContext";
import { ProductTable } from "@/types";

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

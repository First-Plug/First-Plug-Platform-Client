"use client";

import { useStore } from "@/models";
import { observer } from "mobx-react-lite";
import { ProductsTable } from "@/components/Tables";
import { BarLoader } from "@/components/Loader/BarLoader";
import { FilterResetProvider } from "@/components/Tables/Filters/FilterResetContext";
import { ProductTable } from "@/types";

interface DataStockProps {
  assets: ProductTable[];
}

export default observer(function DataStock({ assets }: DataStockProps) {
  return (
    <div className="h-full max-h-full">
      <FilterResetProvider>
        <ProductsTable assets={assets} onClearFilters={() => {}} />
      </FilterResetProvider>
    </div>
  );
});

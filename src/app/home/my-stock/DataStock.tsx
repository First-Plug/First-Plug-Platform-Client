"use client";

import { useStore } from "@/models";
import { observer } from "mobx-react-lite";
import { ProductsTable } from "@/components/Tables";
import { BarLoader } from "@/components/Loader/BarLoader";
import { FilterResetProvider } from "@/components/Tables/Filters/FilterResetContext";

export default observer(function DataStock() {
  return (
    <div className="h-full max-h-full">
      <FilterResetProvider>
        <ProductsTable onClearFilters={() => {}} />
      </FilterResetProvider>
    </div>
  );
});

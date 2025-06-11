import React from "react";
import { useFilterReset } from "./FilterResetContext";
import { ProductsTable } from "../ProductsTable";

import { useGetTableAssets } from "@/features/assets";

export default function ProductsTableWithFilters() {
  const { data: assets = [] } = useGetTableAssets();
  const { resetFilters } = useFilterReset();

  return <ProductsTable onClearFilters={resetFilters} assets={assets} />;
}

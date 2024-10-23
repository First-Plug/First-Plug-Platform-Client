import React from "react";
import { useFilterReset } from "./FilterResetContext";
import { ProductsTable } from "../ProductsTable";
import { observer } from "mobx-react-lite";
import { useGetTableAssets } from "@/assets/hooks";

export default observer(function ProductsTableWithFilters() {
  const { data: assets = [] } = useGetTableAssets();
  const { resetFilters } = useFilterReset();

  return <ProductsTable onClearFilters={resetFilters} assets={assets} />;
});

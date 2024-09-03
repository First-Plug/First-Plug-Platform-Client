import React from "react";
import { useFilterReset } from "./FilterResetContext";
import { ProductsTable } from "../ProductsTable";
import { observer } from "mobx-react-lite";

export default observer(function ProductsTableWithFilters() {
  const { resetFilters } = useFilterReset();

  return <ProductsTable onClearFilters={resetFilters} />;
});

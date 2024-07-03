"use client";

import { useStore } from "@/models";
import { observer } from "mobx-react-lite";
import { ProductsTable } from "@/components/Tables";
import { BarLoader } from "@/components/Loader/BarLoader";

export default observer(function DataStock() {
  const {
    products: { tableProducts },
  } = useStore();

  return (
    <div className=" h-full max-h-full ">
      <ProductsTable />
    </div>
  );
});

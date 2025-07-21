"use client";
import { type UseBoundStore } from "zustand";
import { DataTable } from "@/features/fp-tables";

import {
  type Product,
  useProductsInnerTableColumns,
  useProductsFiltering,
} from "@/features/assets";

interface Props {
  products: Product[];
  useFilterStore: UseBoundStore<any>;
  tableId?: string;
}

export const ProductsDetailsTable = ({
  products,
  useFilterStore,
  tableId,
}: Props) => {
  const { filteredProducts } = useProductsFiltering(
    products,
    useFilterStore,
    tableId
  );

  const columns = useProductsInnerTableColumns({
    products: filteredProducts,
    allProducts: products,
  });

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={filteredProducts}
        useFilterStore={useFilterStore}
        tableId={tableId}
        rowHeight={50}
        adaptiveHeight={true}
        enableSnapScroll={false}
      />
    </div>
  );
};

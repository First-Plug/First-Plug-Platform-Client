import { AddIcon, Button, ShopIcon, UploadIcon } from "@/common";
import { useStore } from "@/models";
import { Table } from "@tanstack/react-table";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
interface ITableStockActions<TData> {
  table: Table<TData>;
  onClearAllFilters?: () => void;
}
export default observer(function TableStockActions<TData>({
  table,
  onClearAllFilters,
}: ITableStockActions<TData>) {
  const router = useRouter();
  const {
    products: { toggleStockToShow, onlyAvaliable },
    aside: { setAside },
  } = useStore();
  const handleFilter = () => {
    toggleStockToShow();
  };
  return (
    <div className=" flex items-center justify-between   h-full w-full ">
      <div className="flex gap-1">
        <input
          type="checkbox"
          checked={onlyAvaliable}
          onChange={handleFilter}
        />
        <label className=" text-gray-500 text-md">
          Show only avaliable stock
        </label>
      </div>

      <div className="flex gap-2   ">
        <Button
          size="small"
          variant="secondary"
          body="Add Product"
          icon={<AddIcon />}
          onClick={() => {
            router.push("/home/my-stock/addOneProduct");
          }}
        />

        <Button
          size="small"
          variant="secondary"
          body="Load Stock"
          icon={<UploadIcon />}
          onClick={() => setAside("LoadStock")}
        />

        <Button
          size="small"
          variant="primary"
          icon={<ShopIcon />}
          body="Shop Now"
          onClick={() => {
            router.push("/shop");
          }}
        />
      </div>
    </div>
  );
});

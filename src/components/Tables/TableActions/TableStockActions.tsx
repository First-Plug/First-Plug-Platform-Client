import { AddIcon, Button, ShopIcon, UploadIcon } from "@/common";
import { useStore } from "@/models";
import { Table } from "@tanstack/react-table";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useFilterReset } from "../Filters/FilterResetContext";

interface ITableStockActions<TData> {
  table: Table<TData>;
  subTable?: Table<TData>;
  onClearAllFilters?: () => void;
}
export default observer(function TableStockActions<TData>({
  table,
  onClearAllFilters,
  subTable,
}: ITableStockActions<TData>) {
  const { resetFilters } = useFilterReset();
  const router = useRouter();
  const {
    products: { toggleStockToShow, onlyAvaliable },
    aside: { setAside },
  } = useStore();

  // const handleClearFilters = () => {
  //   resetFilters();
  //   table.setColumnFilters([]);
  //   subTable?.setColumnFilters([]);
  // };

  const handleFilter = () => {
    toggleStockToShow();
  };
  return (
    <div className=" flex items-center justify-between   h-full w-full ">
      <div className="flex gap-1">
        {/* <Button
          size="small"
          variant="secondary"
          body="CLEAR ALL FILTERS"
          onClick={handleClearFilters}
        /> */}
        <input
          type="checkbox"
          checked={onlyAvaliable}
          onChange={handleFilter}
        />
        <label className=" text-gray-500 text-md">
          Show only available stock
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

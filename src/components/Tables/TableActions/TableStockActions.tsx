import { AddIcon, Button, ShopIcon, UploadIcon, DownloadIcon } from "@/common";
import { useStore } from "@/models";
import { Table } from "@tanstack/react-table";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useFilterReset } from "../Filters/FilterResetContext";
import { CATALOGO_FIRST_PLUG } from "@/config/constanst";
import { UserServices } from "@/services/user.services";
import { useSession } from "next-auth/react";

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
    products: { toggleStockToShow, onlyAvaliable, exportProductsCsv },
    aside: { setAside },
  } = useStore();

  const handleFilter = () => {
    toggleStockToShow();
  };

  const handleExportCsv = async () => {
    try {
      await exportProductsCsv();
    } catch (error) {
      console.error("Failed to export products CSV:", error);
    }
  };

  const { data } = useSession();

  return (
    <div className="flex justify-between items-center w-full h-full">
      <div className="flex gap-1">
        <input
          type="checkbox"
          checked={onlyAvaliable}
          onChange={handleFilter}
        />
        <label className="text-gray-500 text-md">
          Show only available products
        </label>
      </div>

      <div className="flex gap-2">
        <Button
          size="small"
          variant="secondary"
          body="Add Product"
          icon={<AddIcon />}
          onClick={() => {
            router.push("/home/my-stock/add");
          }}
        />

        <Button
          size="small"
          variant="secondary"
          icon={<DownloadIcon />}
          body="Export My Assets"
          onClick={handleExportCsv}
        />

        <Button
          size="small"
          variant="secondary"
          body="Load Assets"
          icon={<UploadIcon />}
          onClick={() => setAside("LoadStock")}
        />

        <Button
          size="small"
          variant="primary"
          icon={<ShopIcon />}
          body="Shop Now"
          onClick={() => {
            const {
              user: { email, tenantName },
            } = data;

            window.open(CATALOGO_FIRST_PLUG, "_blank");
            UserServices.notifyShop(email, tenantName);
          }}
        />
      </div>
    </div>
  );
});

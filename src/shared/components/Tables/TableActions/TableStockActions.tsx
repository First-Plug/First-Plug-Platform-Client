import { AddIcon, Button, ShopIcon, UploadIcon, DownloadIcon } from "@/shared";

import { Table } from "@tanstack/react-table";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useFilterReset } from "../Filters/FilterResetContext";
import { CATALOGO_FIRST_PLUG } from "@/config/constanst";
import { UserServices } from "@/services/user.services";
import { useSession } from "next-auth/react";
import { useAsideStore } from "@/shared";
import { useProductStore } from "@/features/assets";
import { ProductServices } from "@/services/product.services";

interface ITableStockActions<TData> {
  table: Table<TData>;
  subTable?: Table<TData>;
  onClearAllFilters?: () => void;
}
export default function TableStockActions<TData>({
  table,
  onClearAllFilters,
  subTable,
}: ITableStockActions<TData>) {
  const { resetFilters } = useFilterReset();
  const router = useRouter();
  const { setAside } = useAsideStore();

  const handleFilter = () => setOnlyAvailable(!onlyAvailable);

  const handleExportCsv = async () => {
    try {
      await ProductServices.exportProductsCsv();
    } catch (error) {
      console.error("Failed to export products CSV:", error);
    }
  };

  const { data } = useSession();

  const { setOnlyAvailable, onlyAvailable } = useProductStore();

  return (
    <div className="flex justify-between items-center w-full h-full">
      <div className="flex gap-1">
        <input
          id="onlyAvailable"
          type="checkbox"
          checked={onlyAvailable}
          onChange={handleFilter}
        />
        <label htmlFor="onlyAvailable" className="text-gray-500 text-md">
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
}

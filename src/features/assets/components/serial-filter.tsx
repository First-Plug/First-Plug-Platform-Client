"use client";

import * as React from "react";
import { cn } from "@/shared/utils/utils";
import { useProductStore } from "@/features/assets";
import { AssetFilterField } from "./asset-filter-field";

export function SerialFilter() {
  const { selectedSerialNumber, setSelectedSerialNumber } = useProductStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setSelectedSerialNumber(value || null);
  };

  const handleClear = () => {
    setSelectedSerialNumber(null);
  };

  return (
    <AssetFilterField
      hasValue={!!selectedSerialNumber}
      onClear={handleClear}
    >
      <input
        type="text"
        placeholder="Filter by serial number..."
        value={selectedSerialNumber ?? ""}
        onChange={handleChange}
        className={cn(
          "w-full h-full bg-transparent border-0 outline-none text-sm placeholder:text-gray-500",
          "focus:ring-0 focus:outline-none"
        )}
      />
    </AssetFilterField>
  );
}

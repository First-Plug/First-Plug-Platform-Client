import { useFetchWarehouses } from "@/features/warehouses/hooks/useFetchWarehouses";
import { useMemo } from "react";

export interface WarehouseOption {
  id: string;
  name: string;
  countryCode: string;
  country: string;
}

export const useWarehousesForCreate = () => {
  const { data: warehousesData, isLoading, error } = useFetchWarehouses();

  const warehouses = useMemo<WarehouseOption[]>(() => {
    if (!warehousesData) return [];

    return warehousesData
      .filter((w) => w.isActive) // Solo warehouses activos
      .map((warehouse) => ({
        id: warehouse.warehouseId,
        name: warehouse.warehouseName,
        countryCode: warehouse.countryCode,
        country: warehouse.country,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [warehousesData]);

  return {
    warehouses,
    isLoading,
    error,
  };
};

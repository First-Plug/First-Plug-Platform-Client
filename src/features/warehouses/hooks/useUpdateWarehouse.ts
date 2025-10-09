import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WarehousesServices } from "../services/warehouses.services";
import { UpdateWarehouseRequest } from "../interfaces/warehouse.interface";

interface UpdateWarehouseParams {
  country: string;
  warehouseId: string;
  data: UpdateWarehouseRequest;
}

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ country, warehouseId, data }: UpdateWarehouseParams) => {
      return await WarehousesServices.updateWarehouse(country, warehouseId, data);
    },
    onSuccess: () => {
      // Invalidate and refetch warehouses list
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
    onError: (error: any) => {
      console.error("Error updating warehouse:", error);
      throw error;
    },
  });
};

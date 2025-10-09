import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WarehousesServices } from "../services/warehouses.services";
import {
  UpdateWarehouseRequest,
  WarehouseDetails,
} from "../interfaces/warehouse.interface";
import type { WarehouseAPIData } from "../services/warehouses.services";

interface UpdateWarehouseParams {
  country: string;
  warehouseId: string;
  data: UpdateWarehouseRequest;
}

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      country,
      warehouseId,
      data,
    }: UpdateWarehouseParams) => {
      return await WarehousesServices.updateWarehouse(
        country,
        warehouseId,
        data
      );
    },
    // Optimistic update: actualiza el cache ANTES de que llegue la respuesta del servidor
    onMutate: async ({ warehouseId, data, country }) => {
      // Cancelar cualquier refetch en progreso para evitar sobreescribir el update optimista
      await queryClient.cancelQueries({ queryKey: ["warehouses"] });

      // Guardar snapshot del estado anterior para poder revertir en caso de error
      const previousWarehouses = queryClient.getQueryData<WarehouseAPIData[]>([
        "warehouses",
      ]);

      // Actualizar optimísticamente el cache de warehouses
      queryClient.setQueryData<WarehouseAPIData[]>(["warehouses"], (old) => {
        if (!old) return old;

        return old.map((warehouse) => {
          if (warehouse.warehouseId === warehouseId) {
            // Actualizar el warehouse con los nuevos datos
            return {
              ...warehouse,
              warehouseName: data.name,
              partnerType: data.partnerType as
                | "default"
                | "temporary"
                | "own"
                | "partner",
              isActive: data.isActive,
              state: data.state,
              city: data.city,
              zipCode: data.zipCode,
              address: data.address,
              apartment: data.apartment,
              phone: data.phone,
              email: data.email,
              canal: data.canal,
              contactPerson: data.contactPerson,
              additionalInfo: data.additionalInfo,
            };
          }
          return warehouse;
        });
      });

      // También actualizar el selectedWarehouse si existe
      const previousSelected = queryClient.getQueryData<WarehouseDetails>([
        "selectedWarehouse",
      ]);
      if (previousSelected && previousSelected.id === warehouseId) {
        queryClient.setQueryData<WarehouseDetails>(["selectedWarehouse"], {
          ...previousSelected,
          name: data.name,
          partnerType: data.partnerType as
            | "default"
            | "temporary"
            | "own"
            | "partner",
          isActive: data.isActive,
          state: data.state,
          city: data.city,
          zipCode: data.zipCode,
          address: data.address,
          apartment: data.apartment,
          phoneContact: data.phone,
          email: data.email,
          contactChannel: data.canal,
          contactPerson: data.contactPerson,
          additionalInfo: data.additionalInfo,
        });
      }

      // Retornar contexto con el snapshot para poder revertir
      return { previousWarehouses, previousSelected };
    },
    onSuccess: () => {
      // Refetch en background para sincronizar con el servidor
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
    onError: (error: any, variables, context) => {
      // Revertir el optimistic update en caso de error
      if (context?.previousWarehouses) {
        queryClient.setQueryData(["warehouses"], context.previousWarehouses);
      }
      if (context?.previousSelected) {
        queryClient.setQueryData(
          ["selectedWarehouse"],
          context.previousSelected
        );
      }

      console.error("Error updating warehouse:", error);
      throw error;
    },
  });
};

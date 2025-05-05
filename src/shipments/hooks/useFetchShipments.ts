// hooks/useShipments.ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ShipmentServices } from "@/shipments/services/shipments.services";

export const useFetchShipments = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: ["shipments", page, pageSize],
    queryFn: () => ShipmentServices.getAll(page, pageSize),
    placeholderData: keepPreviousData,
  });
};

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ShipmentServices } from "../services/shipments.services";

export const useFetchAllShipments = () => {
  return useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      return await ShipmentServices.getAll();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });
};

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ShipmentServices } from "../services/shipments.services";

export const useFetchAllShipments = () => {
  return useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      return await ShipmentServices.getAll();
    },
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });
};

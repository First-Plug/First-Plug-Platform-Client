import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { LogisticsServices } from "../services/logistics.services";

export const useFetchAllLogisticsShipments = () => {
  return useQuery({
    queryKey: ["logistics-shipments"],
    queryFn: async () => {
      return await LogisticsServices.getAllShipments();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });
};

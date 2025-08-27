import { useQuery } from "@tanstack/react-query";
import { LogisticsServices } from "../services/logistics.services";

export const useFetchAllLogisticsShipments = () => {
  const query = useQuery({
    queryKey: ["logistics-shipments"],
    queryFn: async () => {
      return await LogisticsServices.getAllShipments();
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });

  return query;
};

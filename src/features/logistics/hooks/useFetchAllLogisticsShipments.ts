import { useQuery } from "@tanstack/react-query";
import { LogisticsServices } from "../services/logistics.services";
import { keepPreviousData } from "@tanstack/react-query";
import { useLogisticsDateFilterStore } from "../store/dateFilter.store";

export const useFetchAllLogisticsShipments = () => {
  const { selectedDates } = useLogisticsDateFilterStore();

  const query = useQuery({
    queryKey: [
      "logistics-shipments",
      selectedDates.startDate.toISOString(),
      selectedDates.endDate.toISOString(),
    ],
    queryFn: async () => {
      return await LogisticsServices.getAllShipments(
        selectedDates.startDate.toISOString(),
        selectedDates.endDate.toISOString()
      );
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });

  return query;
};

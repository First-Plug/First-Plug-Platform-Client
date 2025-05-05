import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { HistorialServices } from "../services";

export const useFetchLatestActivity = (
  currentPage: number,
  pageSize: number,
  selectedDates: { startDate: Date; endDate: Date }
) => {
  return useQuery({
    queryKey: [
      "history",
      currentPage,
      pageSize,
      selectedDates.startDate.toISOString(),
      selectedDates.endDate.toISOString(),
    ],
    queryFn: () =>
      HistorialServices.getAll(
        currentPage,
        pageSize,
        selectedDates.startDate.toISOString(),
        selectedDates.endDate.toISOString()
      ),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
};

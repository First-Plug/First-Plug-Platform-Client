import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAllActionHistory } from "@/features/activity";

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
      getAllActionHistory(
        currentPage,
        pageSize,
        selectedDates.startDate.toISOString(),
        selectedDates.endDate.toISOString()
      ),
    placeholderData: keepPreviousData,
  });
};

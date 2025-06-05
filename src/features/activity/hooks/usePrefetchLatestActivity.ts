import { useQueryClient } from "@tanstack/react-query";
import { getAllActionHistory } from "@/features/activity";
import { endOfDay, startOfDay, subDays } from "date-fns";

export const usePrefetchLatestActivity = () => {
  const queryClient = useQueryClient();

  const defaultStart = startOfDay(subDays(new Date(), 6));
  const defaultEnd = endOfDay(new Date());

  const prefetchLatestActivity = async () => {
    try {
      const currentPage = 1;
      const pageSize = 10;

      await queryClient.prefetchQuery({
        queryKey: [
          "history",
          currentPage,
          pageSize,
          defaultStart.toISOString(),
          defaultEnd.toISOString(),
        ],
        queryFn: () =>
          getAllActionHistory(
            currentPage,
            pageSize,
            defaultStart.toISOString(),
            defaultEnd.toISOString()
          ),
        staleTime: 5000,
      });
    } catch (error) {
      console.error("Error al prefetch de actividad más reciente:", error);
    }
  };

  return prefetchLatestActivity;
};

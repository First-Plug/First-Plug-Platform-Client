import { useQueryClient } from "@tanstack/react-query";
import { getAllTeams } from "@/features/teams";

export const usePrefetchTeams = () => {
  const queryClient = useQueryClient();

  const prefetchTeams = () => {
    queryClient.prefetchQuery({
      queryKey: ["teams"],
      queryFn: getAllTeams,
      staleTime: 1000 * 60 * 5,
    });
  };
  return prefetchTeams;
};

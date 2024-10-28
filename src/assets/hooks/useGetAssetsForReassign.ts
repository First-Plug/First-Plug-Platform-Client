import { useQuery } from "@tanstack/react-query";
import { getAssetsForReassign } from "../actions";
import { Product } from "@/types";

export const useGetAssetsForReassign = (id: string) => {
  return useQuery({
    queryKey: ["assets", "reassign", id],
    queryFn: () => getAssetsForReassign(id),
    staleTime: 1000 * 60 * 30, // 30 minutos de tiempo de vida antes de refetch
  });
};

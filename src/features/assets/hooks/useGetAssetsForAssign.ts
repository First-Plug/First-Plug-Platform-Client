import { useQuery } from "@tanstack/react-query";
import { getAssetsForAssign } from "@/features/assets";

export const useGetAssetsForAssign = (id: string) => {
  return useQuery({
    queryKey: ["assets", "assign", id],
    queryFn: () => getAssetsForAssign(id),
    staleTime: 1000 * 60 * 30,
  });
};

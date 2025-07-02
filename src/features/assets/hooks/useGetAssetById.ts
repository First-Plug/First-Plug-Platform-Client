import { useQuery } from "@tanstack/react-query";
import { getAssetById } from "@/features/assets";

export const useFetchAssetById = (id: string) => {
  return useQuery({
    queryKey: ["assets", id],
    queryFn: () => getAssetById(id),
    staleTime: 1000 * 60 * 30,
    enabled: !!id,
  });
};

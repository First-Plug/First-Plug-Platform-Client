import { useQuery } from "@tanstack/react-query";
import { getAssetById } from "../actions";

export const useFetchAssetById = (id: string) => {
  return useQuery({
    queryKey: ["assets", id],
    queryFn: () => getAssetById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

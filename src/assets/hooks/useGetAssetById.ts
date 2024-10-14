import { useQuery } from "@tanstack/react-query";
import { getAssetById } from "../actions";

export const useFetchMember = (id: string) => {
  return useQuery({
    queryKey: ["members", id],
    queryFn: () => getAssetById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

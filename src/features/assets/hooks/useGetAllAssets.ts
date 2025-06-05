import { useQuery } from "@tanstack/react-query";
import { getAllAssets } from "@/features/assets";

export const useGetAllAssets = () => {
  return useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets,
    staleTime: 1000 * 60 * 30,
  });
};

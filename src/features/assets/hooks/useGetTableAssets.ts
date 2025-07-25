import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTableAssets } from "@/features/assets";
import { ProductTable } from "@/features/assets";

export const useGetTableAssets = () => {
  return useQuery<ProductTable[]>({
    queryKey: ["assets"],
    queryFn: getTableAssets,
    staleTime: 1000 * 60 * 30,
    // cacheTime: 1000 * 60 * 60,
    // refetchOnWindowFocus: true,
    // refetchOnReconnect: true,
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  });
};

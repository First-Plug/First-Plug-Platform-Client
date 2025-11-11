import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTableAssets } from "@/features/assets";
import { ProductTable } from "@/features/assets";

export const useGetTableAssets = () => {
  return useQuery<ProductTable[]>({
    queryKey: ["assets"],
    queryFn: getTableAssets,
    staleTime: 1000 * 60 * 2, // Reducido a 2 minutos para mejor reactividad
    // cacheTime: 1000 * 60 * 60,
    refetchOnWindowFocus: true, // Activado para refetch al volver al tab
    // refetchOnReconnect: true,
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  });
};

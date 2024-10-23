import { useQueryClient } from "@tanstack/react-query";
import { getAssetById } from "../actions";
import { Product } from "@/types";

export const usePrefetchAsset = () => {
  const queryClient = useQueryClient();

  const prefetchAsset = async (id: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: ["assets", id],
        queryFn: () => getAssetById(id),
        staleTime: 1000 * 60 * 10,
      });
    } catch (error) {
      console.error(`Error prefetching asset ${id}:`, error);
    }
  };

  return { prefetchAsset };
};

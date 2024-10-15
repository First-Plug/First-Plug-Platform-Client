import { useQueryClient } from "@tanstack/react-query";
import { getAssetById } from "../actions";
import { Product } from "@/types";

export const usePrefetchAsset = () => {
  const queryClient = useQueryClient();

  const prefetchAsset = async (id: string) => {
    try {
      console.log(`Prefetching asset with ID: ${id}`);
      await queryClient.prefetchQuery({
        queryKey: ["assets", id],
        queryFn: () => getAssetById(id),
        staleTime: 1000 * 60 * 10,
      });
      console.log(`Asset ${id} prefetched successfully`);
    } catch (error) {
      console.error(`Error prefetching asset ${id}:`, error);
    }
  };

  return { prefetchAsset };
};

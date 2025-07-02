import { useQueryClient } from "@tanstack/react-query";
import { getTableAssets } from "@/features/assets";

import { ProductTable } from "@/features/assets";

export const usePrefetchAssets = () => {
  const queryClient = useQueryClient();

  let isPrefetching = false;

  const prefetchAssets = async () => {
    if (isPrefetching) return;
    isPrefetching = true;

    try {
      let assets = queryClient.getQueryData<ProductTable[]>(["assets"]);

      if (!assets) {
        assets = await queryClient.fetchQuery<ProductTable[]>({
          queryKey: ["assets"],
          queryFn: getTableAssets,
          staleTime: 1000 * 60 * 5,
        });
      }
    } catch (error) {
      console.error("Error prefetching assets:", error);
    }
  };

  return { prefetchAssets };
};

import { useQueryClient } from "@tanstack/react-query";
import { getTableAssets } from "../actions";
import { useStore } from "@/models";
import { ProductTable } from "@/types";

export const usePrefetchAssets = () => {
  const queryClient = useQueryClient();
  const {
    products: { setTable },
  } = useStore();

  const prefetchAssets = async () => {
    try {
      let assets = queryClient.getQueryData<ProductTable[]>(["assets"]);

      if (!assets) {
        assets = await queryClient.fetchQuery<ProductTable[]>({
          queryKey: ["assets"],
          queryFn: getTableAssets,
          staleTime: 1000 * 60 * 5,
        });
      }

      if (Array.isArray(assets)) {
        setTable(assets);
      } else {
        console.error("Los assets no tienen el formato esperado.");
      }
    } catch (error) {
      console.error("Error prefetching assets:", error);
    }
  };

  return { prefetchAssets };
};

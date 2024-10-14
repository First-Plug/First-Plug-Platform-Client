import { useQueryClient } from "@tanstack/react-query";
import { getTableAssets } from "../actions";

export const usePrefetchAssets = () => {
  const queryClient = useQueryClient();

  const prefetchAssets = async () => {
    console.log("Intentando prefetch...");

    try {
      const cacheData = queryClient.getQueryData(["assets"]);
      console.log("¿Datos existentes en cache?", !!cacheData);

      if (!cacheData) {
        const assets = await queryClient.fetchQuery({
          queryKey: ["assets"],
          queryFn: getTableAssets,
          staleTime: 1000 * 60 * 30,
        });

        if (assets) {
          console.log("Assets fetched successfully:", assets);
        } else {
          console.warn("No se obtuvieron assets.");
        }
      } else {
        console.log("Assets ya en cache.");
      }
    } catch (error: any) {
      console.error("Error fetching assets:", error.message);
    }
  };

  return { prefetchAssets };
};

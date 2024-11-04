import { useQueryClient } from "@tanstack/react-query";
import { getAssetById } from "../actions";

export const usePrefetchAsset = () => {
  const queryClient = useQueryClient();

  const prefetchAsset = async (id: string, attempts = 3) => {
    const cachedData = queryClient.getQueryData(["assets", id]);
    if (cachedData) return cachedData;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        await queryClient.prefetchQuery({
          queryKey: ["assets", id],
          queryFn: () => getAssetById(id),
          staleTime: 1000 * 60 * 10,
        });
        return queryClient.getQueryData(["assets", id]);
      } catch (error) {
        console.error(
          `Error en prefetch intento ${attempt + 1} para asset ${id}:`,
          error
        );
      }
    }
  };

  return { prefetchAsset };
};

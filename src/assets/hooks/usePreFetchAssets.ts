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
      const data = await getTableAssets();
      queryClient.setQueryData(["assets"], data);
      setTable(data);
    } catch (error) {
      console.error("Error prefetching assets:", error);
    }
  };

  return { prefetchAssets };
};

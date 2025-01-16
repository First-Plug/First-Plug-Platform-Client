import { useQueryClient } from "@tanstack/react-query";
import { getTableAssets } from "../actions";
import { useStore } from "@/models";
import { ProductTable } from "@/types";

export const usePrefetchAssets = () => {
  const queryClient = useQueryClient();
  const {
    products: { setTable, tableProducts },
  } = useStore();

  let isPrefetching = false;
  const prefetchAssets = async () => {
    if (isPrefetching) return;
    isPrefetching = true;
    try {
      const currentTableProductIds = tableProducts
        .flatMap((productTable) => productTable.products.map((p) => p._id))
        .filter(Boolean);

      let assets = queryClient.getQueryData<ProductTable[]>(["assets"]);

      if (!assets) {
        assets = await queryClient.fetchQuery<ProductTable[]>({
          queryKey: ["assets"],
          queryFn: getTableAssets,
          staleTime: 1000 * 60 * 5,
        });
      }

      const newTableProductIds = assets
        .flatMap((productTable) => productTable.products.map((p) => p._id))
        .filter(Boolean);

      const isStoreSynced =
        currentTableProductIds.length === newTableProductIds.length &&
        currentTableProductIds.every(
          (id, index) => id === newTableProductIds[index]
        );

      if (!isStoreSynced) {
        setTable(assets);
      } else {
        console.log("El store ya está sincronizado.");
      }
    } catch (error) {
      console.error("Error prefetching assets:", error);
    }
  };

  return { prefetchAssets };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAsset } from "../actions";
import { useStore } from "@/models";
import { Product } from "@/types";

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  const {
    products: { deleteProduct, setProducts },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["assets"] });

      const previousAssets = queryClient.getQueryData<Product[]>(["assets"]);
      queryClient.setQueryData<Product[]>(["assets"], (oldAsset) =>
        oldAsset?.filter((asset) => asset._id !== id)
      );

      return { previousAssets };
    },
    onError: (error, variables, context) => {
      if (context?.previousAssets) {
        queryClient.setQueryData(["assets"], context?.previousAssets);
        console.error("Delete failed:", error);
      }
    },
    onSuccess: (_, id) => {
      const deletedAsset = queryClient.getQueryData<Product[]>(["assets"]);
      deleteProduct(id);
      setProducts(deletedAsset || []);
      setAlert("deleteStock");
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAsset } from "../actions";
import { useStore } from "@/models";
import { Product } from "@/types";

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  const {
    products: { deleteProduct },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteAsset(id);

      return response;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["assets"] });
      const previousAssets = queryClient.getQueryData<Product[]>(["assets"]);

      queryClient.setQueryData<Product[]>(["assets"], (oldAssets) =>
        oldAssets?.filter((asset) => asset._id !== id)
      );

      deleteProduct(id);

      return { previousAssets };
    },
    onError: (error, _, context) => {
      if (context?.previousAssets) {
        queryClient.setQueryData(["assets"], context.previousAssets);
      }
      console.error("Error deleting product:", error);
      setAlert("errorDeleteStock");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setAlert("deleteStock");
    },
  });
};

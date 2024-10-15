import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAsset } from "../actions";
import { useStore } from "@/models";
import { Product } from "@/types";

interface UpdateAssetProps {
  id: string;
  data: Partial<Product>;
}

interface MutationContext {
  previousAsset?: Product;
}

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  const {
    products: { updateProduct },
    alerts: { setAlert },
  } = useStore();

  const mutation = useMutation<
    Product,
    unknown,
    UpdateAssetProps,
    MutationContext
  >({
    mutationFn: ({ id, data }) => updateAsset(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["assets", id] });

      const previousAsset = queryClient.getQueryData<Product>(["assets", id]);

      const optimisticAsset = { ...previousAsset, ...data };

      queryClient.setQueryData<Product>(["assets", id], optimisticAsset);

      if (previousAsset) {
        updateProduct(optimisticAsset);
      }

      return { previousAsset };
    },

    onError: (error, { id }, context) => {
      if (context?.previousAsset) {
        queryClient.setQueryData(["assets", id], context.previousAsset);
      }
      console.error("Error al actualizar el asset:", error);
    },

    onSuccess: (updatedAsset) => {
      if (!updatedAsset.category) {
        console.error("Product update response is missing the category.");
        return;
      }

      queryClient.setQueryData<Product[]>(["assets"], (oldAssets = []) =>
        oldAssets.map((asset) =>
          asset._id === updatedAsset._id ? updatedAsset : asset
        )
      );

      updateProduct(updatedAsset);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setAlert("updateStock");
    },
  });

  return mutation;
};

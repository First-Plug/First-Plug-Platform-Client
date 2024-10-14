import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAsset } from "../actions";
import { useStore } from "@/models";
import { Product } from "@/types";

interface UpdateAssetProps {
  id: string;
  data: Partial<Product>;
}

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  const {
    products: { updateProduct },
    alerts: { setAlert },
  } = useStore();

  const mutation = useMutation({
    mutationFn: ({ id, data }: UpdateAssetProps) => updateAsset(id, data),

    onMutate: async ({ id, data }: UpdateAssetProps) => {
      await queryClient.cancelQueries({ queryKey: ["assets", id] });

      const previousAsset = queryClient.getQueryData<Product>(["assets", id]);

      const optimisticAsset = { ...previousAsset, ...data };

      queryClient.setQueryData<Product>(["assets", id], optimisticAsset);

      return { previousAsset };
    },

    onError: (error, { id }: UpdateAssetProps, context: any) => {
      if (context?.previousAsset) {
        queryClient.setQueryData(["assets", id], context.previousAsset);
      }
      console.error("Error al actualizar el asset:", error);
    },

    onSuccess: (updatedAsset: Product) => {
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

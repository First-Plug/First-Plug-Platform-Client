import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/features/assets";
import { updateEntityAsset } from "../api/updateEntityAsset";
import { useAlertStore } from "@/shared";

interface UpdateAssetProps {
  id: string;
  data: Partial<Product>;
  showSuccessAlert?: boolean;
}

interface MutationContext {
  previousAsset?: Product;
}
type BackendResponse = Product | { message: string };

function isProduct(response: BackendResponse): response is Product {
  return (response as Product)._id !== undefined;
}

export const useUpdateEntityAsset = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();
  const mutation = useMutation<
    BackendResponse,
    unknown,
    UpdateAssetProps,
    MutationContext
  >({
    mutationFn: ({ id, data }) => updateEntityAsset(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["assets", id] });

      const previousAsset = queryClient.getQueryData<Product>(["assets", id]);
      const optimisticAsset = { ...previousAsset, ...data };

      queryClient.setQueryData<Product>(["assets", id], optimisticAsset);

      return { previousAsset };
    },

    onError: (error, { id }, context) => {
      if (context?.previousAsset) {
        queryClient.setQueryData(["assets", id], context.previousAsset);
      }
      console.error("Error al actualizar el asset:", error);
    },

    onSuccess: (response, { id, showSuccessAlert = true }) => {
      if (isProduct(response)) {
        queryClient.setQueryData<Product[]>(["assets"], (oldAssets = []) =>
          oldAssets.map((asset) =>
            asset._id === response._id ? response : asset
          )
        );
      } else {
        const optimisticAsset = queryClient.getQueryData<Product>([
          "assets",
          id,
        ]);
        if (optimisticAsset) {
          queryClient.setQueryData<Product>(["assets", id], optimisticAsset);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      if (showSuccessAlert) {
        setAlert("updateStock");
      }
    },
  });

  return mutation;
};

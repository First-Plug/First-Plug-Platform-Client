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
type BackendResponse = Product | { message: string };

// Type guard para verificar si la respuesta es un producto
function isProduct(response: BackendResponse): response is Product {
  return (response as Product)._id !== undefined;
}

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  const {
    products: { updateProduct },
    alerts: { setAlert },
  } = useStore();

  const mutation = useMutation<
    BackendResponse,
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

      if (previousAsset) updateProduct(optimisticAsset);

      return { previousAsset };
    },

    onError: (error, { id }, context) => {
      if (context?.previousAsset) {
        queryClient.setQueryData(["assets", id], context.previousAsset);
      }
      console.error("Error al actualizar el asset:", error);
    },

    onSuccess: (response, { id }) => {
      if (isProduct(response)) {
        console.log(
          `Producto ${response._id} actualizado correctamente`,
          response
        );

        // Actualiza los datos con la respuesta del backend
        queryClient.setQueryData<Product[]>(["assets"], (oldAssets = []) =>
          oldAssets.map((asset) =>
            asset._id === response._id ? response : asset
          )
        );
        updateProduct(response);
      } else {
        const optimisticAsset = queryClient.getQueryData<Product>([
          "assets",
          id,
        ]);
        if (optimisticAsset) {
          updateProduct(optimisticAsset);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setAlert("updateStock");
    },
  });

  return mutation;
};

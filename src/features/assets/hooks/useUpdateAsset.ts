import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAsset } from "@/features/assets";

import type { Product } from "@/features/assets";
import type { Shipment } from "@/features/shipments";

interface UpdateAssetProps {
  id: string;
  data: Partial<Product> & { actionType: string };
  showSuccessAlert?: boolean;
}

interface MutationContext {
  previousAsset?: Product;
}
type BackendResponse =
  | Product
  | { message: string }
  | { shipment: Shipment; message: string };

function isProduct(response: BackendResponse): response is Product {
  return (response as Product)._id !== undefined;
}

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  const validConditions = ["Optimal", "Defective", "Unusable"];
  const mutation = useMutation<
    BackendResponse,
    unknown,
    UpdateAssetProps,
    MutationContext
  >({
    mutationFn: async ({ id, data }) => {
      const cachedProduct = queryClient.getQueryData<Product>(["assets", id]);
      if (cachedProduct?.productCondition === "Unusable") {
        data.status = cachedProduct.status;
      }

      if (!("productCondition" in data)) {
        data.productCondition = cachedProduct?.productCondition ?? "Optimal";
      }

      const response = await updateAsset(id, data);
      return response;
    },

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

    onSuccess: async (response, { id, showSuccessAlert = true }) => {
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

      // Invalidar y refetchear inmediatamente para forzar la actualización
      await queryClient.invalidateQueries({
        queryKey: ["assets"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["assets"],
        type: "active",
      });

      queryClient.invalidateQueries({ queryKey: ["members"] });

      // Invalidar la query de shipments si se creó uno nuevo
      if (!isProduct(response) && "shipment" in response) {
        queryClient.invalidateQueries({ queryKey: ["shipments"] });
      }

      return response; // Retornamos directamente la respuesta sin envolverla en un objeto
    },
  });

  return mutation;
};

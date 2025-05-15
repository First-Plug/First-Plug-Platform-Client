import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAsset } from "../actions";
import { useStore } from "@/models";
import type { Product } from "@/types";
import type { Shipment } from "@/shipments/interfaces/shipments-response.interface";

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
  const {
    products: { updateProduct },
    alerts: { setAlert },
  } = useStore();
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
        console.log(
          "Preserving existing productCondition:",
          data.productCondition
        );
      }

      console.log("Final data being sent:", data);
      const response = await updateAsset(id, data);
      return response;
    },

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

    onSuccess: (response, { id, showSuccessAlert = true }) => {
      if (isProduct(response)) {
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
      queryClient.invalidateQueries({ queryKey: ["members"] });

      return response; // Retornamos directamente la respuesta sin envolverla en un objeto
    },
  });

  return mutation;
};

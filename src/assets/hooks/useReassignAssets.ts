import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reassignAsset } from "../actions";
import { useStore } from "@/models";
import { Product } from "@/types";

interface ReassignAssetProps {
  id: string;
  data: Partial<Product>;
}

export const useReassignAssets = () => {
  const queryClient = useQueryClient();
  const {
    products: { updateProduct },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: ({ id, data }: ReassignAssetProps) => reassignAsset(id, data),
    onMutate: async ({ id, data }: ReassignAssetProps) => {
      await queryClient.cancelQueries({ queryKey: ["assets", "reassign", id] });

      const previousAsset = queryClient.getQueryData<Product>(["assets", id]);

      const optimisticAsset = { ...previousAsset, ...data };
      queryClient.setQueryData(["assets", id], optimisticAsset);

      return { previousAsset };
    },
    onError: (error, variables, context) => {
      if (context?.previousAsset) {
        queryClient.setQueryData(
          ["assets", variables.id],
          context.previousAsset
        );
      }
    },
    onSuccess: (data) => {
      updateProduct(data);
      setAlert("assignedProductSuccess");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

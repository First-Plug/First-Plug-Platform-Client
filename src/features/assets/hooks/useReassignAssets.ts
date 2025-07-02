import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reassignAsset } from "@/features/assets";
import { useAlertStore } from "@/shared";
import { Product } from "@/features/assets";

interface ReassignAssetProps {
  id: string;
  data: Partial<Product>;
}

export const useReassignAssets = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({ id, data }: ReassignAssetProps) => reassignAsset(id, data),
    onMutate: async ({ id, data }: ReassignAssetProps) => {
      await queryClient.cancelQueries({ queryKey: ["assets", id] });

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
    onSuccess: () => {
      setAlert("assignedProductSuccess");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

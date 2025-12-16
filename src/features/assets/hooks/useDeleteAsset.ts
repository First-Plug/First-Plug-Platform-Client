import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAsset, type Product } from "@/features/assets";
import { useAlertStore } from "@/shared";

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

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

      return { previousAssets };
    },
    onError: (error, _, context) => {
      if (context?.previousAssets) {
        queryClient.setQueryData(["assets"], context.previousAssets);
      }
      setAlert("errorDeleteStock");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setAlert("deleteStock");
    },
  });
};

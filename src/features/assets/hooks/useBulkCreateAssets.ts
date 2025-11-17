import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkCreateAssets, type Product } from "@/features/assets";

import { useAlertStore } from "@/shared";

export const useBulkCreateAssets = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation<Product[], any, Product[]>({
    mutationFn: bulkCreateAssets,
    onMutate: async (newProducts: Product[]) => {
      await queryClient.cancelQueries({ queryKey: ["assets"] });

      const previousProducts = queryClient.getQueryData<Product[]>(["assets"]);
      queryClient.setQueryData<Product[]>(["assets"], (old) => [
        ...(old || []),
        ...newProducts,
      ]);

      return { previousProducts };
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["assets"] });
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["offices"] });
      // Forzar refetch inmediato para actualizar los datos en la UI
      await queryClient.refetchQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";
      setAlert(
        message.includes("Serial Number")
          ? "bulkCreateSerialNumberError"
          : "bulkCreateProductError"
      );
      console.error("Error al crear productos:", message, error);
    },
    retry: (failureCount, error) => {
      const isRecoverableError = error?.response?.status === 429;
      return isRecoverableError && failureCount < 3;
    },
  });
};

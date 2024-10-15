import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkCreateAssets } from "../actions";
import { useStore } from "@/models";
import { Product } from "@/types";

export const useBulkCreateAssets = () => {
  const queryClient = useQueryClient();
  const {
    alerts: { setAlert },
    products: { setProducts },
  } = useStore();

  return useMutation<Product[], any, Product[]>({
    mutationFn: bulkCreateAssets,
    onMutate: async (newProducts: Product[]) => {
      await queryClient.cancelQueries({ queryKey: ["assets"] });

      setProducts(newProducts);

      const previousProducts = queryClient.getQueryData<Product[]>(["assets"]);

      queryClient.setQueryData<Product[]>(["assets"], (old) => [
        ...(old || []),
        ...newProducts,
      ]);

      return { previousProducts };
    },
    onSuccess: (data) => {
      setProducts(data);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setAlert("bulkCreateProductSuccess");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "An unexpected error occurred";
      setAlert(
        message.includes("Serial Number")
          ? "bulkCreateSerialNumberError"
          : "bulkCreateProductError"
      );
    },
  });
};

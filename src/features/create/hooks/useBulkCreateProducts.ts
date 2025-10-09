import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateProductService,
  BulkCreateProductRequest,
} from "../services/create-product.service";

export const useBulkCreateProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkCreateProductRequest) => {
      return await CreateProductService.bulkCreateProducts(data);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas si es necesario
      // queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      console.error("Error creating products:", error);
      throw error;
    },
  });
};

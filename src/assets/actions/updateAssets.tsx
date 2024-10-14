import { Product } from "@/types";
import { ProductServices } from "@/services";

export const updateAsset = async (
  id: Product["_id"],
  data: Partial<Product>
): Promise<Product> => {
  const response = await ProductServices.updateProduct(id, data);
  return response;
};

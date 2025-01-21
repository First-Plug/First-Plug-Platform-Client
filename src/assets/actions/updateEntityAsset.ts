import { Product } from "@/types";
import { ProductServices } from "@/services";

export const updateEntityAsset = async (
  id: Product["_id"],
  data: Partial<Product>
): Promise<Product> => {
  try {
    const response = await ProductServices.updateEntityProduct(id, data);
    return response;
  } catch (error) {
    throw error;
  }
};

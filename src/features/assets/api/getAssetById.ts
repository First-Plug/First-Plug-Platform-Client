import { Product } from "@/features/assets";
import { ProductServices } from "@/services";

export const getAssetById = async (id: string): Promise<Product> => {
  const response = await ProductServices.getProductById(id);
  return response;
};

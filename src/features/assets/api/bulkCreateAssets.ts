import { Product } from "@/features/assets";
import { ProductServices } from "@/services";

export const bulkCreateAssets = async (
  assets: Omit<Product, "_id" | "__v">[]
): Promise<Product[]> => {
  const response = await ProductServices.bulkCreateProducts(assets);
  return response;
};

import { type Product, ProductServices } from "@/features/assets";

export const getAssetById = async (id: string): Promise<Product> => {
  const response = await ProductServices.getProductById(id);
  return response;
};

import { type Product, ProductServices } from "@/features/assets";

export const getAllAssets = async (): Promise<Product[]> => {
  const response = await ProductServices.getAllProducts();
  return response;
};

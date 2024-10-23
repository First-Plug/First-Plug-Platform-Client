import { Product } from "@/types";
import { ProductServices } from "@/services";

export const getAllAssets = async (): Promise<Product[]> => {
  const response = await ProductServices.getAllProducts();
  return response;
};
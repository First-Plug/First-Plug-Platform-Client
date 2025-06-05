import { Product } from "@/types";
import { ProductServices } from "@/services";

export const createAsset = async (
  data: Omit<Product, "_id" | "__v">
): Promise<Product> => {
  const response = await ProductServices.createProduct(data);
  return response;
};

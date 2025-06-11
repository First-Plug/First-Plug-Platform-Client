import { Product } from "@/features/assets";
import { ProductServices } from "@/services";

export const reassignAsset = async (
  id: string,
  data: Partial<Product>
): Promise<Product> => {
  const response = await ProductServices.reassignProduct(id, data);
  return response;
};

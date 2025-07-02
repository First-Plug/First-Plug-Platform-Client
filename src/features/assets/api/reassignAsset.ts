import { type Product, ProductServices } from "@/features/assets";

export const reassignAsset = async (
  id: string,
  data: Partial<Product>
): Promise<Product> => {
  const response = await ProductServices.reassignProduct(id, data);
  return response;
};

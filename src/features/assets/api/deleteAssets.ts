import { ProductServices } from "@/features/assets";

export const deleteAsset = async (id: string): Promise<{ message: string }> => {
  const response = await ProductServices.deleteProduct(id);
  return response;
};

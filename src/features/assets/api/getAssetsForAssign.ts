import { ProductServices } from "@/features/assets";

export const getAssetsForAssign = async (id: string) => {
  const response = await ProductServices.getProductForAssign(id);
  return response;
};

import { ProductServices } from "@/features/assets";

export const getAssetsForReassign = async (id: string) => {
  const response = await ProductServices.getProductForReassign(id);
  return response;
};

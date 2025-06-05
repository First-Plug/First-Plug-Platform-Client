import { Product } from "@/types";
import { ProductServices } from "@/services";

export const getAssetsForReassign = async (id: string) => {
  const response = await ProductServices.getProductForReassign(id);
  return response;
};

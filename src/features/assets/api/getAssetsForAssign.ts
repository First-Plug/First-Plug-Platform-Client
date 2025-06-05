import { Product } from "@/types";
import { ProductServices } from "@/services";

export const getAssetsForAssign = async (id: string) => {
  const response = await ProductServices.getProductForAssign(id);
  return response;
};

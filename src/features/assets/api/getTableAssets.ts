import { ProductTable } from "@/features/assets";
import { ProductServices } from "@/services";

export const getTableAssets = async (): Promise<ProductTable[]> => {
  const response = await ProductServices.getTableFormat();

  return response;
};

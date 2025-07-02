import { type ProductTable, ProductServices } from "@/features/assets";

export const getTableAssets = async (): Promise<ProductTable[]> => {
  const response = await ProductServices.getTableFormat();

  return response;
};

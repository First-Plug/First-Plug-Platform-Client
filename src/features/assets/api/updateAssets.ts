import { type Product, ProductServices } from "@/features/assets";
import type { Shipment } from "@/features/shipments";

export const updateAsset = async (
  id: Product["_id"],
  data: Partial<Product>
): Promise<Product | { message: string; shipment: Shipment }> => {
  const response = await ProductServices.updateProduct(id, data);
  return response;
};

import type { Product } from "@/types";
import type { Shipment } from "@/shipments/interfaces/shipments-response.interface";
import { ProductServices } from "@/services";

export const updateAsset = async (
  id: Product["_id"],
  data: Partial<Product>
): Promise<Product | { message: string; shipment: Shipment }> => {
  const response = await ProductServices.updateProduct(id, data);
  return response;
};

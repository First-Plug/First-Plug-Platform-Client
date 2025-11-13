import { type Product, ProductServices } from "@/features/assets";
import type { Shipment } from "@/features/shipments";

export const updateEntityAsset = async (
  id: Product["_id"],
  data: Partial<Product>
): Promise<Product | { message: string; shipment: Shipment }> => {
  try {
    // Si se está creando un shipment, usar updateProduct que devuelve el shipment
    if (data.fp_shipment) {
      const response = await ProductServices.updateProduct(id, data);
      return response;
    }
    // Si no, usar updateEntityProduct normal
    const response = await ProductServices.updateEntityProduct(id, data);
    return response;
  } catch (error) {
    throw error;
  }
};

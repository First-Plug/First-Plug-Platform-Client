import { BASE_URL, HTTPRequests } from "@/config/axios.config";

export interface BulkCreateProductRequest {
  tenantName: string;
  name: string;
  category: string;
  attributes: Array<{ key: string; value: string }>;
  productCondition: string;
  recoverable: boolean;
  acquisitionDate: string;
  price: {
    amount: number;
    currencyCode: string;
  };
  quantity: number;
  products: Array<{
    serialNumber: string;
    warehouseCountryCode: string;
    additionalInfo?: string;
  }>;
}

export class CreateProductService {
  /**
   * Crear productos en masa para un tenant
   */
  static async bulkCreateProducts(
    data: BulkCreateProductRequest
  ): Promise<any> {
    const response = await HTTPRequests.post(
      `${BASE_URL}/api/superadmin/products/bulk-create-for-tenant`,
      data
    );
    return response.data;
  }
}

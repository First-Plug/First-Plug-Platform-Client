import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { UpdateWarehouseRequest } from "../interfaces/warehouse.interface";

export interface WarehouseAPIResponse {
  success: boolean;
  data: WarehouseAPIData[];
}

export interface WarehouseAPIData {
  countryCode: string;
  country: string;
  warehouseId: string;
  warehouseName: string;
  partnerType: "default" | "temporary" | "own" | "partner";
  isActive: boolean;
  totalProducts: number;
  computers: number;
  otherProducts: number;
  distinctTenants: number;
  tenants: TenantAPIData[];
  hasStoredProducts: boolean;
}

export interface TenantAPIData {
  tenantId: string;
  tenantName: string;
  companyName: string;
  totalProducts: number;
  computers: number;
  otherProducts: number;
}

export class WarehousesServices {
  /**
   * Get all warehouses with tenants
   */
  static async getWarehousesWithTenants(): Promise<WarehouseAPIData[]> {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/superadmin/metrics/warehouses-with-tenants`
    );
    return response.data.data;
  }

  /**
   * Update warehouse data
   */
  static async updateWarehouse(
    country: string,
    warehouseId: string,
    data: UpdateWarehouseRequest
  ): Promise<any> {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/superadmin/warehouses/${country}/${warehouseId}/data`,
      data
    );
    return response.data;
  }
}

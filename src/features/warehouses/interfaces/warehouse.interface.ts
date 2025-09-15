export interface Warehouse {
  id: string;
  name: string;
  country: string;
  partnerType: "temporary" | "own" | "partner";
  isActive: boolean;
  tenantCount: number;
  totalProducts: number;
}

export interface CreateWarehouseRequest {
  name: string;
  country: string;
  partnerType: "temporary" | "own" | "partner";
  isActive: boolean;
}

export interface UpdateWarehouseRequest {
  id: string;
  name?: string;
  country?: string;
  partnerType?: "temporary" | "own" | "partner";
  isActive?: boolean;
}

export interface WarehouseStats {
  totalWarehouses: number;
  activeWarehouses: number;
  totalProducts: number;
  averageTenantsPerWarehouse: number;
}

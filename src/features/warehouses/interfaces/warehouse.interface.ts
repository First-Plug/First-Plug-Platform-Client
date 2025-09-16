export interface Warehouse {
  id: string;
  name: string;
  country: string;
  partnerType: "temporary" | "own" | "partner";
  isActive: boolean;
  tenantCount: number;
  totalProducts: number;
}

export interface WarehouseTenantSummary {
  tenantName: string;
  companyName: string;
  computers: number;
  otherProducts: number;
}

// Detalle extendido para el aside de actualización y selección desde la tabla
export interface WarehouseDetails extends Warehouse {
  state?: string;
  city?: string;
  zipCode?: string;
  address?: string;
  apartment?: string;
  phoneContact?: string;
  email?: string;
  contactChannel?: string;
  contactPerson?: string;
  additionalInfo?: string;
  tenants?: WarehouseTenantSummary[];
}

// Alias semántico para el elemento seleccionado en QueryClient
export type SelectedWarehouse = WarehouseDetails;

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

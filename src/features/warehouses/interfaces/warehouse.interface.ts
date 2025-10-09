export interface Warehouse {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  partnerType: "default" | "temporary" | "own" | "partner";
  isActive: boolean;
  tenantCount: number;
  totalProducts: number;
  computers: number;
  otherProducts: number;
  distinctTenants: number;
  hasStoredProducts: boolean;
}

export interface WarehouseTenantSummary {
  tenantId: string;
  tenantName: string;
  companyName: string;
  totalProducts: number;
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
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  apartment?: string;
  phone?: string;
  email?: string;
  partnerType: string;
  canal?: string;
  contactPerson?: string;
  additionalInfo?: string;
  isActive: boolean;
}

export interface WarehouseStats {
  totalWarehouses: number;
  activeWarehouses: number;
  totalProducts: number;
  averageTenantsPerWarehouse: number;
}

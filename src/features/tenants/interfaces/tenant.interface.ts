export interface Tenant {
  id: string;
  tenantName: string; // Unique tenant identifier (immutable)
  name: string; // Company name (what backend calls "name")
  numberOfActiveUsers: number;
  users: TenantUser[];
  computerExpirationYears: number;
  recoverableConfig: Record<string, boolean>; // Categories that are recoverable
  office?: TenantOffice;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface TenantUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface TenantOffice {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  isDefault: boolean;
}

// DTOs for API operations
export interface CreateTenantRequest {
  tenantName: string;
  name: string; // Company name
  image?: string; // Optional logo URL
}

export interface UpdateTenantRequest {
  name?: string; // Company name
  image?: string; // Logo URL
  computerExpiration?: number; // Backend field name (not computerExpirationYears)
  isRecoverableConfig?: Record<string, boolean>; // Backend field name and format
}

export interface UpdateTenantOfficeRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  averageUsersPerTenant: number;
}

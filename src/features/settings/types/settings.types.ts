// User Profile interfaces
export interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  personalEmail?: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  widgets: { id: string; order: number }[];
  tenantId: string;
}

export interface UpdateUserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  personalEmail?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

// Office interfaces
export interface Office {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  additionalInfo?: string;
  isDefault: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  hasAssignedProducts?: boolean; // true si tiene productos asignados (no se puede eliminar)
  hasActiveShipments?: boolean; // true si tiene envíos activos (no se puede eliminar)
  hasActiveProducts?: boolean; // Propiedad legacy, ahora se usa hasAssignedProducts y hasActiveShipments
}

export interface CreateOffice {
  name: string;
  country: string;
  email?: string;
  phone?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  additionalInfo?: string;
}

export interface UpdateOffice {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  additionalInfo?: string;
}

// Tenant Config interfaces
export interface TenantConfig {
  tenantName: string;
  name: string;
  isRecoverableConfig: Record<string, boolean>;
  computerExpiration: number;
}

export interface UpdateTenantConfig {
  name?: string;
  isRecoverableConfig?: Record<string, boolean>;
  computerExpiration?: number;
}

// Security interfaces
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

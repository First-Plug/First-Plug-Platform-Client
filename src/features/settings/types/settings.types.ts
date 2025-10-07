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
  hasActiveProducts?: boolean; // true si tiene productos recoverables o envíos activos (no se puede eliminar)
}

export interface CreateOffice {
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

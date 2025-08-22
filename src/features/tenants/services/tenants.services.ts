import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import type {
  Tenant,
  TenantUser,
  CreateTenantRequest,
  UpdateTenantRequest,
  UpdateTenantOfficeRequest,
  TenantStats,
} from "../interfaces/tenant.interface";

export class TenantsServices {
  /**
   * Get all tenants
   */
  static async getAllTenants(): Promise<Tenant[]> {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/superadmin/tenants`
    );
    return response.data;
  }

  /**
   * Get a specific tenant by ID
   */
  static async getTenantById(id: string): Promise<Tenant> {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/superadmin/tenants/${id}`
    );
    return response.data;
  }

  /**
   * Create a new tenant
   */
  static async createTenant(data: CreateTenantRequest): Promise<Tenant> {
    const response = await HTTPRequests.post(
      `${BASE_URL}/api/superadmin/tenants`,
      data
    );
    return response.data;
  }

  /**
   * Update tenant configuration (company name, computer expiration, recoverable config)
   */
  static async updateTenant(
    id: string,
    data: UpdateTenantRequest
  ): Promise<Tenant> {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/superadmin/tenants/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Update tenant office information
   */
  static async updateTenantOffice(
    tenantId: string,
    data: UpdateTenantOfficeRequest
  ): Promise<Tenant> {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/superadmin/tenants/${tenantId}/office`,
      data
    );
    return response.data;
  }

  /**
   * Get users belonging to a specific tenant
   */
  static async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/superadmin/tenants/${tenantId}/users`
    );
    return response.data;
  }

  /**
   * Get tenant statistics
   */
  static async getTenantStats(): Promise<TenantStats> {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/superadmin/tenants/stats`
    );
    return response.data;
  }

  /**
   * Activate/Deactivate a tenant (toggle)
   */
  static async toggleTenantStatus(
    id: string,
    _isActive?: boolean // This parameter is ignored by backend - it just toggles
  ): Promise<Tenant> {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/superadmin/tenants/${id}/toggle-active`
    );
    return response.data;
  }

  /**
   * Delete a tenant (soft delete)
   */
  static async deleteTenant(id: string): Promise<void> {
    await HTTPRequests.delete(`${BASE_URL}/api/superadmin/tenants/${id}`);
  }

  /**
   * Get tenant by tenant name (unique identifier)
   */
  static async getTenantByTenantName(tenantName: string): Promise<Tenant> {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/superadmin/tenants/by-name/${tenantName}`
    );
    return response.data;
  }
}

import { HTTPRequests } from "@/config/axios.config";
import { BASE_URL } from "@/config/axios.config";
import type {
  UnassignedUser,
  AssignUserToTenantRequest,
} from "../interfaces/unassignedUser.interface";

export class UnassignedUsersServices {
  /**
   * Get all unassigned users (users without tenantId)
   */
  static async getUnassignedUsers(): Promise<UnassignedUser[]> {
    const response = await HTTPRequests.get(`${BASE_URL}/api/users/unassigned`);
    return response.data;
  }

  /**
   * Assign user to tenant with role
   */
  static async assignUserToTenant(
    userId: string,
    data: AssignUserToTenantRequest
  ): Promise<any> {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/users/${userId}/assign-tenant-superadmin`,
      data
    );
    return response.data;
  }
}

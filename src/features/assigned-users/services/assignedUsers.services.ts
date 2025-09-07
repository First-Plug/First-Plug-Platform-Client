import { HTTPRequests } from "@/config/axios.config";
import { BASE_URL } from "@/config/axios.config";
import type { AssignedUser, UpdateAssignedUserRequest } from "../interfaces/assignedUser.interface";

export class AssignedUsersServices {
  /**
   * Get all assigned users (users with tenantId assigned)
   */
  static async getAssignedUsers(): Promise<AssignedUser[]> {
    const response = await HTTPRequests.get(`${BASE_URL}/api/users/assigned`);
    return response.data;
  }

  /**
   * Update assigned user (firstName, lastName, role only)
   */
  static async updateAssignedUser(
    userId: string, 
    data: UpdateAssignedUserRequest
  ): Promise<AssignedUser> {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/users/${userId}/update-superadmin`,
      data
    );
    return response.data;
  }
}

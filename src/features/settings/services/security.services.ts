import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { ChangePasswordRequest } from "../types/settings.types";

export class SecurityServices {
  static async changePassword(data: ChangePasswordRequest): Promise<void> {
    const response = await HTTPRequests.post(
      `${BASE_URL}/api/auth/change-password`,
      data
    );
    return response.data;
  }
}

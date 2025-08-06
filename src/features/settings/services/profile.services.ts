import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { UserProfile, UpdateUserProfile } from "../types/settings.types";

export class ProfileServices {
  static async getUserProfile(): Promise<UserProfile> {
    const response = await HTTPRequests.get(`${BASE_URL}/api/users/profile`);
    return response.data;
  }

  static async updateUserProfile(data: UpdateUserProfile): Promise<UserProfile> {
    const response = await HTTPRequests.patch(`${BASE_URL}/api/users/profile`, data);
    return response.data;
  }
}

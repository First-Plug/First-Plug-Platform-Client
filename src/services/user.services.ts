import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { UserZod } from "@/types";
import axios from "axios";

export class UserServices {
  static async updateUser(data: UserZod) {
    const loginRes = await HTTPRequests.patch(`${BASE_URL}/api/user`, data);

    return loginRes;
  }
  static async updateRecoverableConfig(
    tenantName: string,
    config: Record<string, boolean>
  ) {
    try {
      const response = await axios.patch(
        `${BASE_URL}/api/tenant/update-recoverable`,
        {
          tenantName,
          isRecoverableConfig: config,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error al actualizar la configuración de recoverable",
        error
      );
      throw error;
    }
  }

  static async getRecoverableConfig(tenantName: string) {
    try {
      const response = await HTTPRequests.get(
        `${BASE_URL}/api/user/recoverable-config/${tenantName}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching recoverable config", error);
      throw error;
    }
  }
}

import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { Office, UpdateOffice } from "../types/settings.types";

export class OfficeServices {
  static async getDefaultOffice(): Promise<Office> {
    const response = await HTTPRequests.get(`${BASE_URL}/api/offices/default`);
    return response.data;
  }

  static async updateDefaultOffice(data: UpdateOffice): Promise<Office> {
    const response = await HTTPRequests.patch(`${BASE_URL}/api/offices/default`, data);
    return response.data;
  }
}

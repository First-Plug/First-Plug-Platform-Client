import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { HistorialResponse } from "@/action-history/interfaces";

export class HistorialServices {
  static async getAll(page: number, size: number) {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/history?page=${page}&size=${size}`
    );

    return response.data as HistorialResponse;
  }
}

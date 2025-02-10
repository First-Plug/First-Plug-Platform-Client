import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { HistorialResponse } from "@/action-history/interfaces";
import { startOfDay, endOfDay } from "date-fns";

export class HistorialServices {
  static async getAll(
    page: number,
    size: number,
    startDate: string,
    endDate: string
  ) {
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const formattedStartDate = start.toISOString();
    const formattedEndDate = end.toISOString();

    const response = await HTTPRequests.get(
      `${BASE_URL}/api/history?page=${page}&size=${size}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
    );

    return response.data as HistorialResponse;
  }
}

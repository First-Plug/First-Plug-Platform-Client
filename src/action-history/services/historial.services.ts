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

  static async getAllServerSide(
    page: number,
    size: number,
    startDate: string,
    endDate: string,
    token: string
  ) {
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const formattedStartDate = start.toISOString();
    const formattedEndDate = end.toISOString();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API}/api/history?page=${page}&size=${size}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) throw new Error("Failed to fetch history data");

    return response.json() as Promise<HistorialResponse>;
  }
}

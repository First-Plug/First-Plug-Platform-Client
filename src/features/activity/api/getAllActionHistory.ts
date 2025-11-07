import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { HistorialResponse } from "@/features/activity";
import { endOfDay, startOfDay } from "date-fns";

export const getAllActionHistory = async (
  page: number,
  size: number,
  startDate: string,
  endDate: string
) => {
  try {
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const formattedStartDate = start.toISOString();
    const formattedEndDate = end.toISOString();

    const response = await HTTPRequests.get(
      `${BASE_URL}/api/history?page=${page}&size=${size}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
    );

    return response.data as HistorialResponse;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

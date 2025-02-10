import { HistorialServices } from "@/action-history/services";

export const getAllActionHistory = async (
  page: number,
  size: number,
  startDate: string,
  endDate: string
) => {
  try {
    return await HistorialServices.getAll(page, size, startDate, endDate);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

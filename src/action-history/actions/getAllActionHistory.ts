import { HistorialServices } from "@/action-history/services";

export const getAllActionHistory = async (page: number, size: number) => {
  try {
    return await HistorialServices.getAll(page, size);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

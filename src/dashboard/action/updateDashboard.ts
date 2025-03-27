import { UserServices } from "@/services/user.services";
import type { Widget } from "../interfaces/widget.interface";

export const updateDashboard = async (widgets: Widget[]) => {
  const response = await UserServices.updateDashboard(widgets);
  return response;
};

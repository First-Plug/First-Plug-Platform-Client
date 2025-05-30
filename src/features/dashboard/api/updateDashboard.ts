import type { Widget } from "@/features/dashboard";
import { HTTPRequests } from "@/config/axios.config";
import { BASE_URL } from "@/config/axios.config";

export const updateDashboard = async (widgets: Widget[]) => {
  try {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/user/update-dashboard`,
      {
        widgets,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating dashboard", error);
    throw error;
  }
};

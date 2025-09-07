import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AssignedUsersServices } from "../services/assignedUsers.services";

export const useFetchAssignedUsers = () => {
  return useQuery({
    queryKey: ["assigned-users"],
    queryFn: async () => {
      console.log("🔍 Fetching assigned users from API...");
      try {
        const result = await AssignedUsersServices.getAssignedUsers();
        console.log("✅ Assigned users received:", result);
        return result;
      } catch (error: any) {
        console.error("❌ API Error:", error);
        console.error("Error details:", {
          status: error?.response?.status,
          message: error?.message,
          url: error?.config?.url,
        });
        throw error;
      }
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });
};

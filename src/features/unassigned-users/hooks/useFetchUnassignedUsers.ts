import { useQuery } from "@tanstack/react-query";
import { UnassignedUsersServices } from "../services/unassignedUsers.services";

export const useFetchUnassignedUsers = () => {
  return useQuery({
    queryKey: ["unassigned-users"],
    queryFn: async () => {
      console.log("🔍 Fetching unassigned users from API...");
      try {
        const result = await UnassignedUsersServices.getUnassignedUsers();
        console.log("✅ Unassigned users received:", result);
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UnassignedUsersServices } from "../services/unassignedUsers.services";
import type { AssignUserToTenantRequest } from "../interfaces/unassignedUser.interface";
import { useAlertStore } from "@/shared";

export const useAssignUserToTenant = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: AssignUserToTenantRequest;
    }) => {
      console.log("🔄 Assigning user to tenant:", userId, data);
      return UnassignedUsersServices.assignUserToTenant(userId, data);
    },
    onSuccess: (assignedUser, _variables) => {
      console.log("✅ User assigned successfully:", assignedUser);

      // Show success alert
      setAlert("userUpdatedSuccesfully");

      // Invalidate and refetch unassigned users (user should disappear)
      queryClient.invalidateQueries({ queryKey: ["unassigned-users"] });

      // Invalidate and refetch assigned users (user should appear)
      queryClient.invalidateQueries({ queryKey: ["assigned-users"] });

      // Also invalidate tenants in case stats changed
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: (error: any) => {
      console.error("❌ Error assigning user:", error);
      console.error("Error details:", {
        status: error?.response?.status,
        message: error?.message,
        data: error?.response?.data,
      });
    },
  });
};

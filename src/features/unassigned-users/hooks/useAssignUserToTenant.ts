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
      return UnassignedUsersServices.assignUserToTenant(userId, data);
    },
    onSuccess: (_assignedUser, _variables) => {
      setAlert("userUpdatedSuccesfully");

      queryClient.invalidateQueries({ queryKey: ["unassigned-users"] });

      queryClient.invalidateQueries({ queryKey: ["assigned-users"] });

      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: (_error: any) => {
      // Error handling is done in the component
    },
  });
};

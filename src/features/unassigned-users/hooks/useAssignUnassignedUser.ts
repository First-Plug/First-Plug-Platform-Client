"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UnassignedUsersServices } from "../services/unassignedUsers.services";
import {
  AssignUserToTenantRequest,
  UnassignedUser,
} from "../interfaces/unassignedUser.interface";
import { useAlertStore } from "@/shared";

type MutationVars = {
  userId: string;
  data: AssignUserToTenantRequest;
};

export const useAssignUnassignedUser = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({ userId, data }: MutationVars) =>
      UnassignedUsersServices.assignUserToTenant(userId, data),

    onMutate: async (vars: MutationVars) => {
      await queryClient.cancelQueries({ queryKey: ["unassigned-users"] });

      const previousUsers = queryClient.getQueryData<UnassignedUser[]>([
        "unassignedUsers",
      ]);

      queryClient.setQueryData<UnassignedUser[]>(
        ["unassigned-users"],
        (old = []) => old.filter((u) => u._id !== vars.userId)
      );

      return { previousUsers };
    },

    onError: (error, _variables, context) => {
      console.error("Error assigning user:", error);

      if (context?.previousUsers) {
        queryClient.setQueryData(["unassignedUsers"], context.previousUsers);
      }

      setAlert("errorAssignedTenant");
    },

    onSuccess: (_data, vars) => {
      setAlert("assignedTenantSuccess");

      queryClient.invalidateQueries({ queryKey: ["unassigned-users"] });
      queryClient.invalidateQueries({ queryKey: ["assigned-users"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants", "stats"] });

      if ("tenantId" in vars.data) {
        queryClient.invalidateQueries({
          queryKey: ["tenant-users", vars.data.tenantId],
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["unassignedUsers"] });
    },
  });
};

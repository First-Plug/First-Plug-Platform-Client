"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UnassignedUsersServices } from "../services/unassigned-users.services";
import { UnassignedUser } from "../interfaces/unassigned-user.interface";
import { useAlertStore } from "@/shared";

interface AssignUserData {
  userId: string;
  tenant: string;
  role: string;
}

export const useAssignUnassignedUser = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({ userId, tenant, role }: AssignUserData) =>
      UnassignedUsersServices.assignUser(userId, { tenant, role }),

    onMutate: async ({ userId }: AssignUserData) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ["unassignedUsers"] });

      // Obtener el estado anterior
      const previousUsers = queryClient.getQueryData<UnassignedUser[]>([
        "unassignedUsers",
      ]);

      // Actualización optimista: remover el usuario de la lista
      queryClient.setQueryData<UnassignedUser[]>(
        ["unassignedUsers"],
        (oldUsers = []) => oldUsers.filter((user) => user.id !== userId)
      );

      return { previousUsers };
    },

    onError: (error, variables, context) => {
      console.error("Error assigning user:", error);

      // Restaurar el estado anterior en caso de error
      if (context?.previousUsers) {
        queryClient.setQueryData(["unassignedUsers"], context.previousUsers);
      }

      setAlert("errorAssignedProduct");
    },

    onSuccess: (data, variables) => {
      // Usuario asignado exitosamente
      setAlert("assignedProductSuccess");

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["unassignedUsers"] });
    },

    onSettled: () => {
      // Siempre invalidar al final
      queryClient.invalidateQueries({ queryKey: ["unassignedUsers"] });
    },
  });
};

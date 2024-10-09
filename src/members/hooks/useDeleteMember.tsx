import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMemberAction } from "../actions";
import { useStore } from "@/models";
import { TeamMember } from "@/types";

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const {
    members: { setMembers, deleteMember },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: (id: string) => deleteMemberAction(id),

    onMutate: async (id: string) => {
      // Cancelar cualquier fetch en curso
      await queryClient.cancelQueries({ queryKey: ["members"] });

      // Obtener el estado anterior de los miembros
      const previousMembers = queryClient.getQueryData<TeamMember[]>([
        "members",
      ]);

      // Actualizar el cache de React Query de manera optimista
      queryClient.setQueryData<TeamMember[]>(
        ["members"],
        (oldMembers) => oldMembers?.filter((member) => member._id !== id) || []
      );

      // Retornar el estado anterior para poder hacer un rollback en caso de error
      return { previousMembers };
    },

    // Restaurar el estado anterior si hubo un error
    onError: (error, id, context) => {
      console.error("Error deleting member:", error);
      if (context?.previousMembers) {
        queryClient.setQueryData(["members"], context.previousMembers);
      }
    },

    // No recargar desde el servidor; solo actualizar el store de MobX
    onSuccess: (data, id) => {
      setAlert("deleteMember");
      const updatedMembers = queryClient.getQueryData<TeamMember[]>([
        "members",
      ]);
      deleteMember(id);
      setMembers(updatedMembers || []); // Esto sincroniza MobX con los datos cacheados
    },
  });
};

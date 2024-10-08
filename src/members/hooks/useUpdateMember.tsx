import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMember } from "../actions";
import { TeamMember } from "@/types";
import { useStore } from "@/models";

interface UpdateMemberProps {
  id: string;
  data: Partial<TeamMember>;
}

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const {
    members: { updateMember: updateMemberInStore },
    alerts: { setAlert },
  } = useStore();

  const mutation = useMutation({
    mutationFn: ({ id, data }: UpdateMemberProps) => updateMember(id, data),

    onMutate: async ({ id, data }: UpdateMemberProps) => {
      // Cancelar queries pendientes
      await queryClient.cancelQueries({ queryKey: ["members", id] });

      // Obtener el miembro previo antes de actualizar
      const previousMember = queryClient.getQueryData<TeamMember>([
        "members",
        id,
      ]);

      // Crear un miembro optimista
      const optimisticMember = { ...previousMember, ...data };
      console.log("Miembro antes de mutar (optimista):", optimisticMember);

      // Actualizar el cache con el miembro optimista
      queryClient.setQueryData<TeamMember>(["members", id], optimisticMember);
      console.log("Cache actualizado con miembro optimista:", optimisticMember);

      return { previousMember };
    },

    onError: (err, variables, context) => {
      console.error("Error en la mutación:", err);
      if (context?.previousMember) {
        queryClient.setQueryData(
          ["members", variables.id],
          context.previousMember
        );
        console.log(
          "Cache restaurado con el miembro anterior:",
          context.previousMember
        );
      }
    },

    onSuccess: (data) => {
      console.log("Mutación exitosa, miembro real desde el servidor:", data);
      updateMemberInStore(data);
      setAlert("updateMember");
    },

    onSettled: (data, error, variables) => {
      console.log("Mutación completada. Invalidando queries...");
      queryClient.invalidateQueries({ queryKey: ["members", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  return mutation;
};

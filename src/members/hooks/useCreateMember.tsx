import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMember } from "../actions";
import { TeamMember } from "@/types";
import { useStore } from "@/models";
import { cast } from "mobx-state-tree";
import handleApiError from "../helpers/handleApiError";

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  const {
    members: { addMember },
    alerts: { setAlert },
  } = useStore();

  const mutation = useMutation({
    mutationFn: (newMember: TeamMember) => createMember(newMember),

    onMutate: async (newMember) => {
      await queryClient.cancelQueries({ queryKey: ["members"] });

      const previousMembers = queryClient.getQueryData<TeamMember[]>([
        "members",
      ]);
      // Crear un miembro optimista
      const optimisticMember: TeamMember = {
        _id: Math.random().toString(),
        firstName: newMember.firstName || "FirstName (optimistic)",
        lastName: newMember.lastName || "LastName (optimistic)",
        fullName: `${newMember.firstName || "First"} ${
          newMember.lastName || "Last"
        }`,
        email: newMember.email || "email@example.com",
        picture: newMember.picture || "",
        position: newMember.position || "",
        personalEmail: newMember.personalEmail || "",
        phone: newMember.phone || "",
        city: newMember.city || "",
        country: newMember.country || "",
        zipCode: newMember.zipCode || "",
        address: newMember.address || "",
        apartment: newMember.apartment || "",
        additionalInfo: newMember.additionalInfo || "",
        startDate: newMember.startDate || "",
        birthDate: newMember.birthDate || null,
        products: cast(newMember.products || []),
        team: newMember.team || "Not Assigned",
        teamId: newMember.teamId || "",
        dni: newMember.dni || 0,
        isDeleted: false,
        activeShipment: false,
        hasOnTheWayShipment: false,
      };

      // Agregar el miembro optimista a la lista de miembros
      queryClient.setQueryData<TeamMember[]>(["members"], (oldMembers) => {
        if (!oldMembers) return [optimisticMember];
        return [...oldMembers, optimisticMember];
      });
      return { previousMembers, optimisticMember };
    },
    onSuccess: (data) => {
      // Remover el miembro optimista y agregar el miembro real
      queryClient.setQueryData<TeamMember[]>(["members"], (oldMembers) => {
        if (!oldMembers) return [data];

        // Reemplazar el miembro optimista por el real
        return oldMembers.map((member) =>
          member._id === data._id ? data : member
        );
      });

      // Actualizar el store de MobX
      addMember(data);
      setAlert("createMember");
    },
    // si hay error, se restaura el estado anterior
    onError: (error, variables, context) => {
      const alertType = handleApiError(error);
      setAlert(alertType);

      // Restaurar cache anterior en caso de error
      queryClient.setQueryData(["members"], context?.previousMembers);
    },
    // finalizada la operacion se invalida la query para que tenga obtenga los datos mas recientes del backend
    onSettled: async () => {
      await queryClient.refetchQueries({
        queryKey: ["members"],
      });
      await queryClient.refetchQueries({
        queryKey: ["teams"],
      });
      await queryClient.refetchQueries({
        queryKey: ["assets"],
      });
    },
  });
  return mutation;
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMember, handleApiError } from "@/features/members";
import { Member } from "@/features/members";

import { useAlertStore } from "@/shared";

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  const mutation = useMutation({
    mutationFn: (newMember: Member) => createMember(newMember),

    onMutate: async (newMember) => {
      await queryClient.cancelQueries({ queryKey: ["members"] });

      const previousMembers = queryClient.getQueryData<Member[]>(["members"]);
      // Crear un miembro optimista
      const optimisticMember: Member = {
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
        products: newMember.products || [],
        team: newMember.team || undefined,
        teamId: newMember.teamId || "",
        dni: newMember.dni || 0,
        isDeleted: false,
        activeShipment: false,
        hasOnTheWayShipment: false,
      };

      // Agregar el miembro optimista a la lista de miembros
      queryClient.setQueryData<Member[]>(["members"], (oldMembers) => {
        if (!oldMembers) return [optimisticMember];
        return [...oldMembers, optimisticMember];
      });
      return { previousMembers, optimisticMember };
    },
    onSuccess: (data) => {
      // Remover el miembro optimista y agregar el miembro real
      queryClient.setQueryData<Member[]>(["members"], (oldMembers) => {
        if (!oldMembers) return [data];

        // Reemplazar el miembro optimista por el real
        return oldMembers.map((member) =>
          member._id === data._id ? data : member
        );
      });

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

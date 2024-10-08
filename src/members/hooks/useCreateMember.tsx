import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMember } from "../actions";
import { TeamMember } from "@/types";
import { useStore } from "@/models";
import { cast } from "mobx-state-tree";

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  const {
    members: { addMember },
    alerts: { setAlert },
  } = useStore();

  const mutation = useMutation({
    mutationFn: (newMember: TeamMember) => createMember(newMember),

    onMutate: async (newMember) => {
      console.log("Miembro antes de mutar (optimista):", newMember);
      await queryClient.cancelQueries({ queryKey: ["members"] });

      const previousMembers = queryClient.getQueryData<TeamMember[]>([
        "members",
      ]);
      console.log("Miembros anteriores en el cache:", previousMembers);
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
      };
      console.log("Miembro optimista creado:", optimisticMember);

      // Agregar el miembro optimista a la lista de miembros
      queryClient.setQueryData<TeamMember[]>(["members"], (oldMembers) => {
        if (!oldMembers) return [optimisticMember];
        return [...oldMembers, optimisticMember];
      });
      console.log(
        "Cache actualizado con miembro optimista:",
        queryClient.getQueryData(["members"])
      );
      return { previousMembers, optimisticMember };
    },
    onSuccess: (data) => {
      console.log("Mutación exitosa, miembro real desde el servidor:", data);
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
      console.log("Error en la mutación:", error);
      queryClient.setQueryData(["members"], context?.previousMembers);
    },
    // finalizada la operacion se invalida la query para que tenga obtenga los datos mas recientes del backend
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
  return mutation;
};

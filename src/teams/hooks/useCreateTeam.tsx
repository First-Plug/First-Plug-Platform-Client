import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeams } from "../actions";
import { Team } from "@/types";
import { useStore } from "@/models";

type CreateTeamProps = {
  name: string;
  color: string;
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const {
    teams: { addTeam },
    alerts: { setAlert },
  } = useStore();

  const mutation = useMutation({
    mutationFn: (newTeam: CreateTeamProps) => createTeams(newTeam),

    onMutate: async (newTeam) => {
      console.log("Equipo antes de mutar (optimista):", newTeam);
      await queryClient.cancelQueries({ queryKey: ["teams"] });

      const previousTeams = queryClient.getQueryData<Team[]>(["teams"]);
      console.log("Equipos anteriores en el cache:", previousTeams);

      // Crear un equipo optimista
      const optimisticTeam: Team = {
        _id: Math.random().toString(),
        name: newTeam.name || "Unnamed Team (optimistic)",
        color: newTeam.color || "#000000",
        __v: 0,
      };
      console.log("Equipo optimista creado:", optimisticTeam);

      // Agregar el equipo optimista a la lista de equipos
      queryClient.setQueryData<Team[]>(["teams"], (oldTeams) => {
        if (!oldTeams) return [optimisticTeam];
        return [...oldTeams, optimisticTeam];
      });

      return { previousTeams, optimisticTeam };
    },

    onSuccess: (data) => {
      console.log("Mutación exitosa, equipo real desde el servidor:", data);
      // Remover el equipo optimista y agregar el equipo real
      queryClient.setQueryData<Team[]>(["teams"], (oldTeams) => {
        if (!oldTeams) return [data];

        // Reemplazar el equipo optimista por el real
        return oldTeams.map((team) => (team._id === data._id ? data : team));
      });

      // Actualizar el store de MobX
      addTeam(data);
      setAlert("createTeam");
    },

    onError: (error, variables, context) => {
      console.error("Error al crear el equipo:", error);

      // Restaurar el cache anterior en caso de error
      queryClient.setQueryData(["teams"], context?.previousTeams);
    },

    onSettled: () => {
      // Invalida las queries para obtener los datos más recientes del backend
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  return mutation;
};

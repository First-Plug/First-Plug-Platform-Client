import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeams } from "../actions";
import { Team } from "@/types";
import { useStore } from "@/models";

type CreateTeamProps = {
  name: string;
  color?: string;
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const {
    teams: { addTeam },
    alerts: { setAlert },
  } = useStore();

  const mutation = useMutation({
    mutationFn: (newTeam: CreateTeamProps) => {
      const teamPayload = { name: newTeam.name };
      return createTeams(teamPayload);
    },

    onMutate: async (newTeam) => {
      await queryClient.cancelQueries({ queryKey: ["teams"] });

      const previousTeams = queryClient.getQueryData<Team[]>(["teams"]);

      // Crear un equipo optimista
      const optimisticTeam: Team = {
        _id: Math.random().toString(),
        name: newTeam.name || "Unnamed Team (optimistic)",
        color: newTeam.color || "#000000",
        __v: 0,
      };

      // Agregar el equipo optimista a la lista de equipos
      queryClient.setQueryData<Team[]>(["teams"], (oldTeams) => {
        if (!oldTeams) return [optimisticTeam];
        return [...oldTeams, optimisticTeam];
      });

      return { previousTeams, optimisticTeam };
    },

    onSuccess: (data) => {
      queryClient.setQueryData<Team[]>(["teams"], (oldTeams) => {
        if (!oldTeams) return [data];
        return oldTeams.map((team) => (team._id === data._id ? data : team));
      });

      addTeam(data); // Actualiza el MobX store
      setAlert("createTeam");
    },

    onError: (error, variables, context) => {
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

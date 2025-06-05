import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useFetchTeams, useCreateTeam } from "@/features/teams";

export const useGetOrCreateTeam = () => {
  const queryClient = useQueryClient();
  const { data: teams = [] } = useFetchTeams();
  const createTeamMutation = useCreateTeam();

  const getOrCreateTeam = async (teamName: string) => {
    // Buscar si el equipo ya existe
    let team = teams.find((team) => team.name === teamName);

    if (!team) {
      // Si no existe, crearlo
      team = await createTeamMutation.mutateAsync({ name: teamName });

      // Invalidar la query para obtener la lista actualizada de equipos
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    }

    return team;
  };

  return { getOrCreateTeam };
};

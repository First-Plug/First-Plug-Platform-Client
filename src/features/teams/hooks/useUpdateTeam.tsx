import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeam } from "@/features/teams";
import { useStore } from "@/models";
import { Team } from "@/types";

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const {
    teams: { updateTeam: updateStoreTeam },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: ({ id, team }: { id: string; team: Partial<Team> }) =>
      updateTeam(id, team),

    onSuccess: (data) => {
      updateStoreTeam(data);
      // setAlert("updateTeamSuccess");

      // Opcionalmente puedes refetchear directamente desde el store si es necesario
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error) => {
      console.error("Error updating team:", error);
      //   setAlert("updateTeamError");
    },
  });
};

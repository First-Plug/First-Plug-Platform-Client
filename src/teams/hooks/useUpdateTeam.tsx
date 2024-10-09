import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeam } from "../actions";
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
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      updateStoreTeam(data);
      //   setAlert("updateTeamSuccess");
    },
    onError: (error) => {
      console.error("Error updating team:", error);
      //   setAlert("updateTeamError");
    },
  });
};

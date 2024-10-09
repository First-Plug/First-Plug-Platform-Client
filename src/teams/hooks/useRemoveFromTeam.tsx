import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFromTeam } from "../actions";
import { useStore } from "@/models";

export const useRemoveFromTeam = () => {
  const queryClient = useQueryClient();
  const {
    teams: { updateTeam },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      removeFromTeam(teamId, memberId),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      updateTeam(data);
      //   setAlert("removeFromTeamSuccess");
    },
    onError: (error) => {
      console.error("Error removing member from team:", error);
      //   setAlert("removeFromTeamError");
    },
  });
};

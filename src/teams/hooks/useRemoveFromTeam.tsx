import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFromTeam } from "../actions";
import { useStore } from "@/models";

export const useRemoveFromTeam = () => {
  const queryClient = useQueryClient();
  const {
    teams: { updateTeam },
  } = useStore();

  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      removeFromTeam(teamId, memberId),

    onSuccess: (data) => {
      updateTeam(data);
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error) => {
      //   setAlert("removeFromTeamError");
    },
  });
};

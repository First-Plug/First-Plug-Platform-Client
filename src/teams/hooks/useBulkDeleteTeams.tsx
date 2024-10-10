import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkDeleteTeams } from "../actions";
import { useStore } from "@/models";
import { Team } from "@/types";

export const useBulkDeleteTeams = () => {
  const queryClient = useQueryClient();
  const {
    teams: { removeTeam },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: (teamIds: string[]) => bulkDeleteTeams(teamIds),
    onMutate: async (teamIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ["teams"] });
      const previousTeams = queryClient.getQueryData<Team[]>(["teams"]);

      if (previousTeams) {
        queryClient.setQueryData<Team[]>(["teams"], (oldTeams = []) =>
          oldTeams.filter((team) => !teamIds.includes(team._id))
        );
      }

      return { previousTeams };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setAlert("deleteTeam");
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["teams"], context?.previousTeams);
      setAlert("errorDeleteTeam");
    },
  });
};

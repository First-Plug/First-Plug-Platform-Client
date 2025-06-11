import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkDeleteTeams } from "@/features/teams";
import { type Team } from "@/features/teams";
import { useAlertStore } from "@/shared";

export const useBulkDeleteTeams = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

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

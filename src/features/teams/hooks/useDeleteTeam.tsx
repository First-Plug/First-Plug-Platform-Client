import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTeam } from "@/features/teams";
import { useStore } from "@/models";
import { Team } from "@/types";

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  const {
    teams: { removeTeam, setTeams },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["teams"] });

      const previousTeams = queryClient.getQueryData<Team[]>(["teams"]);

      queryClient.setQueryData<Team[]>(
        ["teams"],
        (oldTeams) => oldTeams?.filter((team) => team._id !== id) || []
      );
      return { previousTeams };
    },
    onError: (error, id, context) => {
      if (context?.previousTeams) {
        queryClient.setQueryData(["Teams"], context.previousTeams);
      }
    },
    onSuccess: (data, id) => {
      removeTeam(id);
      setAlert("deleteTeam");
      const updatedTeams = queryClient.getQueryData<Team[]>(["teams"]);
      setTeams(updatedTeams || []);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTeam } from "@/features/teams";
import { type Team } from "@/features/teams";
import { useAlertStore } from "@/shared";

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  const { setAlert } = useAlertStore();

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
    onSuccess: () => {
      setAlert("deleteTeam");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
};

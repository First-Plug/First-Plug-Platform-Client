import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToTeam } from "@/features/teams";
import { type Team } from "@/features/teams";

export const useAddToTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      addToTeam(teamId, memberId),
    onMutate: async ({ teamId, memberId }) => {
      await queryClient.cancelQueries({ queryKey: ["teams"] });

      const previousTeams = queryClient.getQueryData<Team[]>(["teams"]);

      queryClient.setQueryData<Team[]>(["teams"], (oldTeams) => {
        return oldTeams?.map((team) =>
          team._id === teamId ? { ...team } : team
        );
      });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      return { previousTeams };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["teams"], context?.previousTeams);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
};

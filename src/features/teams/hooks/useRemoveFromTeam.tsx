import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFromTeam } from "@/features/teams";

export const useRemoveFromTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      removeFromTeam(teamId, memberId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
};

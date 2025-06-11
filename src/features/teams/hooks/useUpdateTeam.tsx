import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeam, type Team } from "@/features/teams";
import { useAlertStore } from "@/shared";

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({ id, team }: { id: string; team: Partial<Team> }) =>
      updateTeam(id, team),

    onSuccess: () => {
      setAlert("updateTeam");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error) => {
      console.error("Error updating team:", error);
      setAlert("errorUpdateTeam");
    },
  });
};

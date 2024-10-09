import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToTeam } from "../actions";
import { useStore } from "@/models";
import { Team } from "@/types";

export const useAddToTeam = () => {
  const queryClient = useQueryClient();
  const {
    teams: { updateTeam },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      addToTeam(teamId, memberId),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      updateTeam(data); // actualizo el estado de MobX
    },
    onError: (error) => {
      console.error("Error adding member to team:", error);
    },
  });
};

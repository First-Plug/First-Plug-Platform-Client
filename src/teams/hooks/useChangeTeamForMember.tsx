import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeTeamForMember } from "../actions";
import { useStore } from "@/models";

export const useChangeTeamForMember = () => {
  const queryClient = useQueryClient();
  const {
    teams: { updateTeam },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: ({ memberId, teamId }: { memberId: string; teamId: string }) =>
      changeTeamForMember(memberId, teamId),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      updateTeam(data);
      //   setAlert("changeTeamSuccess");
    },
    onError: (error) => {
      console.error("Error changing team for member:", error);
      //   setAlert("changeTeamError");
    },
  });
};

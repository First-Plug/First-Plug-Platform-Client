import { useMutation, useQueryClient } from "@tanstack/react-query";
import { associateTeamToMember } from "@/features/teams";
import { useStore } from "@/models";

export const useAssociateTeamToMember = () => {
  const queryClient = useQueryClient();
  const {
    teams: { updateTeam },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      associateTeamToMember(teamId, memberId),

    onSuccess: (data) => {
      updateTeam(data);
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });

      //   setAlert("associateTeamSuccess");
    },
    onError: (error) => {
      console.error("Error associating team to member:", error);
      //   setAlert("associateTeamError");
    },
  });
};

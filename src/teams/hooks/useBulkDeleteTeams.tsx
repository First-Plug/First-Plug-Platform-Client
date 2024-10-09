import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkDeleteTeams } from "../actions";
import { useStore } from "@/models";

export const useBulkDeleteTeams = () => {
  const queryClient = useQueryClient();
  const {
    teams: { removeTeam },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: (teamIds: string[]) => bulkDeleteTeams(teamIds),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setAlert("deleteTeam");
    },
    onError: (error) => {
      console.error("Error deleting teams:", error);
      setAlert("errorDeleteTeam");
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeams } from "../actions";
import { Team } from "@/types";
import { useStore } from "@/models";

type CreateTeamProps = {
  name: string;
  color?: string;
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const {
    teams: { addTeam },
    alerts: { setAlert },
  } = useStore();

  const mutation = useMutation({
    mutationFn: (newTeam: CreateTeamProps) => {
      const teamPayload = { name: newTeam.name };
      return createTeams(teamPayload);
    },

    onMutate: async (newTeam) => {
      await queryClient.cancelQueries({ queryKey: ["teams"] });

      const previousTeams = queryClient.getQueryData<Team[]>(["teams"]);

      const optimisticTeam: Team = {
        _id: Math.random().toString(),
        name: newTeam.name || "Unnamed Team (optimistic)",
        color: newTeam.color || "#000000",
        __v: 0,
      };

      queryClient.setQueryData<Team[]>(["teams"], (oldTeams) => {
        if (!oldTeams) return [optimisticTeam];
        return [...oldTeams, optimisticTeam];
      });

      return { previousTeams, optimisticTeam };
    },

    onSuccess: (data) => {
      queryClient.setQueryData<Team[]>(["teams"], (oldTeams) => {
        if (!oldTeams) return [data];
        return [...oldTeams, data];
      });
      addTeam(data);
      setAlert("createTeam");
    },

    onError: (error, variables, context) => {
      queryClient.setQueryData(["teams"], context?.previousTeams);
    },

    onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  return mutation;
};

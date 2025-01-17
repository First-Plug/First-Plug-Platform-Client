import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMemberAction } from "../actions";
import { useStore } from "@/models";
import { TeamMember } from "@/types";

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const {
    members: { setMembers, deleteMember },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: (id: string) => deleteMemberAction(id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["members"] });

      const previousMembers = queryClient.getQueryData<TeamMember[]>([
        "members",
      ]);

      queryClient.setQueryData<TeamMember[]>(
        ["members"],
        (oldMembers) => oldMembers?.filter((member) => member._id !== id) || []
      );

      return { previousMembers };
    },

    onError: (error, id, context) => {
      console.error("Error deleting member:", error);
      if (context?.previousMembers) {
        queryClient.setQueryData(["members"], context.previousMembers);
      }
    },

    onSuccess: (data, id) => {
      setAlert("deleteMember");
      const updatedMembers = queryClient.getQueryData<TeamMember[]>([
        "members",
      ]);

      deleteMember(id);
      setMembers(updatedMembers || []);
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

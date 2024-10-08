import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMember } from "../actions";
import { useStore } from "@/models";
import { TeamMember } from "@/types";

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const {
    members: { deleteMember: deleteMemberFromStore },
  } = useStore();

  return useMutation({
    mutationFn: (id: string) => deleteMember(id),
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
      if (context?.previousMembers) {
        queryClient.invalidateQueries({ queryKey: ["members"] });
      }
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      deleteMemberFromStore(id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
};

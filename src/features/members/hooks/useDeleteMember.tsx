import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMemberAction } from "@/features/members";
import { Member } from "@/features/members";
import { useAlertStore } from "@/shared";

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: (id: string) => deleteMemberAction(id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["members"] });

      const previousMembers = queryClient.getQueryData<Member[]>(["members"]);

      queryClient.setQueryData<Member[]>(
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

    onSuccess: () => {
      setAlert("deleteMember");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

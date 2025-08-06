import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMember, Member, handleApiError } from "@/features/members";
import { useAlertStore } from "@/shared";

interface UpdateMemberProps {
  id: string;
  data: Partial<Member>;
}

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  const mutation = useMutation({
    mutationFn: ({ id, data }: UpdateMemberProps) => updateMember(id, data),

    onMutate: async ({ id, data }: UpdateMemberProps) => {
      await queryClient.cancelQueries({ queryKey: ["members", id] });

      const previousMember = queryClient.getQueryData<Member>(["members", id]);

      const optimisticMember = { ...previousMember, ...data };

      queryClient.setQueryData<Member>(["members", id], optimisticMember);

      return { previousMember };
    },

    onError: (err, variables, context) => {
      console.error("Error en la mutación:", err);

      const alertType = handleApiError(err);
      setAlert(alertType);

      if (context?.previousMember) {
        queryClient.setQueryData(
          ["members", variables.id],
          context.previousMember
        );
      }
    },

    onSuccess: (data, id) => {
      queryClient.setQueryData<Member[]>(["members"], (oldMembers) => {
        return oldMembers.map((member) =>
          member._id === data._id ? data : member
        );
      });

      setAlert("updateMember");

      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["members", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });

  return mutation;
};

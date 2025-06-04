import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMember } from "@/features/members";
import { Member } from "@/features/members";

import { useStore } from "@/models";

interface UpdateMemberProps {
  id: string;
  data: Partial<Member>;
}

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const {
    members: { updateMember: updateMemberInStore },
    alerts: { setAlert },
  } = useStore();

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
      updateMemberInStore(data);
      setAlert("updateMember");

      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
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

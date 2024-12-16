import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMember } from "../actions";
import { TeamMember } from "@/types";
import { useStore } from "@/models";

interface UpdateMemberProps {
  id: string;
  data: Partial<TeamMember>;
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

      const previousMember = queryClient.getQueryData<TeamMember>([
        "members",
        id,
      ]);

      const optimisticMember = { ...previousMember, ...data };

      queryClient.setQueryData<TeamMember>(["members", id], optimisticMember);

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
      queryClient.setQueryData<TeamMember[]>(["members"], (oldMembers) =>
        oldMembers.map((member) => (member._id === data._id ? data : member))
      );
      updateMemberInStore(data);
      setAlert("updateMember");

      // Invalidar solo si es necesario
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["members", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  return mutation;
};

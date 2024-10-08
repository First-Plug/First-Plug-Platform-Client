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

      queryClient.setQueryData<TeamMember>(["members", id], {
        ...previousMember,
        ...data,
      });

      return { previousMember };
    },

    onError: (err, variables, context) => {
      if (context?.previousMember) {
        queryClient.setQueryData(
          ["members", variables.id],
          context.previousMember
        );
      }
      console.error("Error en la mutación:", err);
    },

    onSuccess: (data) => {
      updateMemberInStore(data);
      setAlert("updateMember");
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["members", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  return mutation;
};

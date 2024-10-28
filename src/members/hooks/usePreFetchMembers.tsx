import { useQueryClient } from "@tanstack/react-query";
import { getAllMembers } from "../actions";
import { useStore } from "@/models";
import { TeamMember } from "@/types";

export const usePrefetchMembers = () => {
  const queryClient = useQueryClient();
  const {
    members: { setMembers },
  } = useStore();

  const prefetchMembers = async () => {
    try {
      let members = queryClient.getQueryData(["members"]);

      if (!members) {
        members = await queryClient.fetchQuery<TeamMember[]>({
          queryKey: ["members"],
          queryFn: getAllMembers,
          staleTime: 1000 * 60 * 10,
        });
      }

      if (Array.isArray(members)) {
        setMembers(members);
      } else {
        console.error("Los datos de miembros no tienen el formato esperado.");
      }
    } catch (error) {
      console.error("Error al prefetch de miembros:", error);
    }
  };

  return prefetchMembers;
};

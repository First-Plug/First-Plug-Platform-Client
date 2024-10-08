import { useQueryClient } from "@tanstack/react-query";
import { getMember } from "../actions"; // La acción que obtiene un miembro por ID

export const usePrefetchMember = () => {
  const queryClient = useQueryClient();

  const prefetchMember = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ["members", id],
      queryFn: () => getMember(id),
      staleTime: 1000 * 60 * 5,
    });
  };

  return prefetchMember;
};

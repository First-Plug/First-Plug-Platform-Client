import { useQuery } from "@tanstack/react-query";
import { getMember } from "../actions";

export const useFetchMember = (id: string) => {
  return useQuery({
    queryKey: ["members", id],
    queryFn: () => getMember(id),
    staleTime: 1000 * 60 * 5, // aca tengo que definir cuanto tiempo quiero que duren los datos antes del refetch
    // cacheTime: 1000 * 60 * 30, // aca tengo que definir cuanto tiempo quiero que duren los datos en cache
  });
};

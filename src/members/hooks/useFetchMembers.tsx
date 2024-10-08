import { useQuery } from "@tanstack/react-query";
import { getAllMembers } from "../actions";

export const useFetchMembers = () => {
  return useQuery({
    queryKey: ["members"],
    queryFn: getAllMembers,
    staleTime: 1000 * 60 * 5, // aca tengo que definir cuanto tiempo quiero que duren los datos antes del refetch
  });
};

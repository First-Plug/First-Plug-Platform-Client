import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllTeams } from "../actions";
import { Team } from "@/types";

export const useFetchTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getAllTeams,
    staleTime: 1000 * 60 * 30, // aca tengo que definir cuanto tiempo quiero que duren los datos antes del refetch
  });
};

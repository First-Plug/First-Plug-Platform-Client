import { useQuery } from "@tanstack/react-query";
import { getAllTeams } from "../actions";

export const useFetchTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getAllTeams,
    staleTime: 1000 * 60 * 30,
  });
};

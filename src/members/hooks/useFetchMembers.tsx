import { useQuery } from "@tanstack/react-query";
import { getAllMembers } from "../actions";

export const useFetchMembers = () => {
  return useQuery({
    queryKey: ["members"],
    queryFn: getAllMembers,
    staleTime: 1000 * 60 * 30,
  });
};

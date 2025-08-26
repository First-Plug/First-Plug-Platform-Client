import { useQuery } from "@tanstack/react-query";
import { UnassignedUsersServices } from "../services/unassignedUsers.services";

export const useFetchUnassignedUsers = () => {
  return useQuery({
    queryKey: ["unassigned-users"],
    queryFn: async () => {
      return await UnassignedUsersServices.getUnassignedUsers();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

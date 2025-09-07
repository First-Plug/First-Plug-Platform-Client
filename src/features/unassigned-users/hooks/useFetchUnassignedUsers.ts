import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { UnassignedUsersServices } from "../services/unassignedUsers.services";

export const useFetchUnassignedUsers = () => {
  return useQuery({
    queryKey: ["unassigned-users"],
    queryFn: async () => {
      return await UnassignedUsersServices.getUnassignedUsers();
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });
};

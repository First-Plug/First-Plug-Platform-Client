import { useQuery } from "@tanstack/react-query";
import { getUserSettings } from "../actions/getUserSettings";

export const useFetchUserSettings = (tenantName?: string) => {
  return useQuery({
    queryKey: ["userSettings", tenantName],
    queryFn: getUserSettings,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!tenantName,
  });
};

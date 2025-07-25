import { useQuery } from "@tanstack/react-query";
import { Datum } from "@/features/activity";
import { BASE_URL, HTTPRequests } from "@/config/axios.config";

const fetchActivityLatest = async (): Promise<Datum[]> => {
  const response = await HTTPRequests.get(`${BASE_URL}/api/history/latest`);
  return response.data as Datum[];
};

export const useActivityLatest = () => {
  return useQuery({
    queryKey: ["activityLatest"],
    queryFn: fetchActivityLatest,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

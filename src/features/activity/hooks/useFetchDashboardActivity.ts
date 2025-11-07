import { useQuery } from "@tanstack/react-query";
import { Datum } from "@/features/activity";
import { BASE_URL, HTTPRequests } from "@/config/axios.config";

const fetchActivityLatest = async (): Promise<Datum[]> => {
  try {
    const response = await HTTPRequests.get(`${BASE_URL}/api/history/latest`);
    // Validación defensiva: asegurar que siempre retornemos un array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching activity latest:", error);
    return [];
  }
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

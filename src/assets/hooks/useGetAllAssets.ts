import { useQuery } from "@tanstack/react-query";
import { getAllAssets } from "../actions";

export const useGetAllAssets = () => {
  return useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets,
    staleTime: 1000 * 60 * 30,
  });
};

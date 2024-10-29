import { useQuery } from "@tanstack/react-query";
import { getMember } from "../actions";

export const useFetchMember = (id?: string) => {
  return useQuery({
    queryKey: ["member", id],
    queryFn: () => {
      if (!id) throw new Error("No valid member ID provided");
      return getMember(id);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

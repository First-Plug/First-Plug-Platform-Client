import { useQuery } from "@tanstack/react-query";
import { getMember } from "@/features/members";

export const useFetchMember = (id?: string) => {
  return useQuery({
    queryKey: ["member", id],
    queryFn: () => {
      if (!id) throw new Error("No valid member ID provided");
      return getMember(id);
    },
    staleTime: 0,
    enabled: !!id,
  });
};

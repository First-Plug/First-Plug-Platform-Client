"use client";
import { useQueryClient } from "@tanstack/react-query";
import { getAllMembers } from "@/features/members";
import { Member } from "@/features/members";
import { useEffect, useCallback } from "react";

export const usePrefetchMembers = () => {
  const queryClient = useQueryClient();

  const prefetchMembers = useCallback(async () => {
    try {
      let members = queryClient.getQueryData(["members"]);

      if (!members) {
        members = await queryClient.fetchQuery<Member[]>({
          queryKey: ["members"],
          queryFn: getAllMembers,
          staleTime: 1000 * 60 * 10,
        });
      }

      if (Array.isArray(members)) {
        queryClient.setQueryData(["members"], members);
      } else {
        console.error("Los datos de miembros no tienen el formato esperado.");
      }
    } catch (error) {
      console.error("Error al prefetch de miembros:", error);
    }
  }, [queryClient]);

  return prefetchMembers;
};

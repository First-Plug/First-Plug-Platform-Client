"use client";
import { useQueryClient } from "@tanstack/react-query";
import { getAllMembers } from "@/features/members";
import { useStore } from "@/models";
import { Member } from "@/features/members";
import { useEffect, useCallback } from "react";

export const usePrefetchMembers = () => {
  const queryClient = useQueryClient();
  const store = useStore();

  const prefetchMembers = useCallback(async () => {
    if (!store) return;

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
        store.members.setMembers(members);
      } else {
        console.error("Los datos de miembros no tienen el formato esperado.");
      }
    } catch (error) {
      console.error("Error al prefetch de miembros:", error);
    }
  }, [queryClient, store]);

  useEffect(() => {
    if (store) {
      prefetchMembers();
    }
  }, [store, prefetchMembers]);

  return prefetchMembers;
};

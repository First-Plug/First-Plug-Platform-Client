"use client";
import { useEffect } from "react";
import { useStore } from "@/models";

import { PageLayout, BarLoader } from "@/shared";
import { useFetchMembers, DataMembers, EmptyMembers } from "@/features/members";

export default function MyTeam() {
  const { data: members = [], isLoading, isFetching } = useFetchMembers();
  const {
    members: { setMembers },
  } = useStore();

  useEffect(() => {
    if (members.length) setMembers(members);
  }, [members, setMembers]);

  const isLoadingMembers = isLoading || isFetching;
  const hasMembers = members.length > 0;

  return (
    <PageLayout>
      {isLoadingMembers ? (
        <BarLoader />
      ) : hasMembers ? (
        <DataMembers members={members} />
      ) : (
        <EmptyMembers />
      )}
    </PageLayout>
  );
}

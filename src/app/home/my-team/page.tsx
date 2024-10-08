"use client";
import { PageLayout } from "@/common";
import DataTeam from "./DataTeam";
import EmptyTeam from "./EmptyTeam";
import { BarLoader } from "@/components/Loader/BarLoader";
import { useEffect } from "react";
import { setAuthInterceptor } from "@/config/axios.config";
import { useFetchMembers } from "@/members/hooks";
import { useStore } from "@/models";

export default function MyTeam() {
  const { data: members = [], isLoading, isFetching } = useFetchMembers();
  const {
    members: { setMembers },
  } = useStore();

  useEffect(() => {
    if (members.length) {
      setMembers(members);
    }
  }, [members, setMembers]);

  useEffect(() => {
    if (sessionStorage.getItem("accessToken")) {
      setAuthInterceptor(sessionStorage.getItem("accessToken"));
    }
  }, []);
  return (
    <PageLayout>
      {isLoading || isFetching ? (
        <BarLoader />
      ) : members.length ? (
        <DataTeam />
      ) : (
        <EmptyTeam />
      )}
    </PageLayout>
  );
}

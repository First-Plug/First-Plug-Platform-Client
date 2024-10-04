"use client";
import { PageLayout } from "@/common";
import DataTeam from "./DataTeam";
import EmptyTeam from "./EmptyTeam";
import { BarLoader } from "@/components/Loader/BarLoader";
import { useEffect } from "react";
import { setAuthInterceptor } from "@/config/axios.config";
import { useFetchMembers } from "@/members/hooks";

export default function MyTeam() {
  const { data: members = [], isLoading } = useFetchMembers();

  useEffect(() => {
    if (sessionStorage.getItem("accessToken")) {
      setAuthInterceptor(sessionStorage.getItem("accessToken"));
    }
  }, []);
  return (
    <PageLayout>
      {isLoading && <BarLoader />}
      {!isLoading && members.length ? <DataTeam /> : <EmptyTeam />}
    </PageLayout>
  );
}

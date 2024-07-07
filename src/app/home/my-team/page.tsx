"use client";
import { PageLayout } from "@/common";
import { useStore } from "@/models/root.store";
import DataTeam from "./DataTeam";
import EmptyTeam from "./EmptyTeam";
import { observer } from "mobx-react-lite";
import { BarLoader } from "@/components/Loader/BarLoader";
import useFetch from "@/hooks/useFetch";
import { useEffect, useState } from "react";
import { setAuthInterceptor } from "@/config/axios.config";

export default observer(function MyTeam() {
  const [loading, setLoading] = useState(true);
  const {
    members: { members, fetchingMembers },
  } = useStore();
  const { fetchMembers } = useFetch();
  useEffect(() => {
    if (sessionStorage.getItem("accessToken")) {
      setAuthInterceptor(sessionStorage.getItem("accessToken"));
      if (!members.length) {
        fetchMembers();
      }
    }
    setLoading(false);
  }, []);
  return (
    <PageLayout>
      {!fetchingMembers && members?.length ? <DataTeam /> : null}
      {!fetchingMembers && !members.length && !loading && <EmptyTeam />}
      {fetchingMembers && <BarLoader />}
    </PageLayout>
  );
});

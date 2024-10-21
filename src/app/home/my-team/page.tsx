"use client";
import { PageLayout } from "@/common";
import { useStore } from "@/models/root.store";
import DataTeam from "./DataTeam";
import EmptyTeam from "./EmptyTeam";
import { observer } from "mobx-react-lite";
import { BarLoader } from "@/components/Loader/BarLoader";
import useFetch from "@/hooks/useFetch";
import { useEffect, useRef, useState } from "react";
import { setAuthInterceptor } from "@/config/axios.config";

export default observer(function MyTeam() {
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const {
    members: { members, fetchingMembers },
  } = useStore();
  const { fetchMembers, fetchMembersAndTeams } = useFetch();
  const timerRef = useRef<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!timerRef.current) {
        timerRef.current = true;
      }

      try {
        await fetchMembersAndTeams();
      } catch (error) {
        console.error("Failed to fetch members and teams:", error);
      } finally {
        if (timerRef.current) {
          timerRef.current = false;
        }
        setLoading(false);
        setHasFetched(true);
      }
    };

    if (
      sessionStorage.getItem("accessToken") &&
      !fetchingMembers &&
      members.length === 0 &&
      !hasFetched
    ) {
      setAuthInterceptor(sessionStorage.getItem("accessToken"));
      fetchData();
    } else {
      setLoading(false);
    }
  }, [fetchMembersAndTeams, members.length, fetchingMembers, hasFetched]);

  if (loading || fetchingMembers) return <BarLoader />;

  return (
    <PageLayout>
      {members.length > 0 ? <DataTeam /> : <EmptyTeam />}{" "}
    </PageLayout>
  );
});

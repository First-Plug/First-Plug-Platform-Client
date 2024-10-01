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
  const {
    members: { members, fetchingMembers },
  } = useStore();
  const { fetchMembers, fetchMembersAndTeams } = useFetch();
  const timerRef = useRef(false);

  useEffect(() => {
    if (!timerRef.current) {
      console.time("Total time to fetch members and teams");
      timerRef.current = true;
    }

    if (sessionStorage.getItem("accessToken")) {
      setAuthInterceptor(sessionStorage.getItem("accessToken"));

      if (!members.length && !fetchingMembers) {
        fetchMembersAndTeams()
          .then(() => {
            if (timerRef.current) {
              console.timeEnd("Total time to fetch members and teams");
              timerRef.current = false;
            }
          })
          .catch((error) => {
            console.error("Failed to fetch members and teams:", error);
            if (timerRef.current) {
              console.timeEnd("Total time to fetch members and teams");
              timerRef.current = false;
            }
          });
      }
    }

    setLoading(false);
  }, [members, fetchingMembers]);
  return (
    <PageLayout>
      {!fetchingMembers && members?.length ? <DataTeam /> : null}
      {!fetchingMembers && !members.length && !loading && <EmptyTeam />}
      {fetchingMembers && <BarLoader />}
    </PageLayout>
  );
});

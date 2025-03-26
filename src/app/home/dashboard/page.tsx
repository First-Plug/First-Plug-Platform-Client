"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { createSwapy, Swapy } from "swapy";
import { useStore } from "@/models";
import { setAuthInterceptor } from "@/config/axios.config";
import { AuthServices } from "@/services";

import { useFetchTeams } from "@/teams/hooks";
import { useFetchMembers } from "@/members/hooks";
import { useGetTableAssets } from "@/assets/hooks";
import { EmptyDashboardCard, PageLayout } from "@/common";
import { Loader } from "@/components/Loader";

import DashboardLayout from "@/dashboard/DashboardLayout";
import { ItemDashboard } from "@/dashboard/ItemDashboard";
import { MyAssets } from "@/dashboard/MyAssets";
import { ComputerUpdates } from "@/dashboard/ComputerUpdates";
import { UpcomingBirthdays } from "@/dashboard/UpcomingBirthdays";
import { MembersByCountry } from "@/dashboard/MembersByCountry";
import { useFetchUserSettings } from "@/components/settings/hooks/useFetchUserSettings";

export default observer(function Dashboard() {
  const { data: sessionData } = useSession();
  const [loading, setLoading] = useState(true);

  const queryClient = useQueryClient();

  const {
    alerts: { setAlert },
    user: { user, setUser },
  } = useStore();

  const { isFetching: isFetchingSettings } = useFetchUserSettings(
    user?.tenantName
  );
  const { isLoading: isLoadingMembers } = useFetchTeams();
  const { data: membersData, isLoading: isLoadingTeams } = useFetchMembers();
  const { data: assets, isLoading: isLoadingAssets } = useGetTableAssets();

  useEffect(() => {
    if (sessionStorage.getItem("accessToken")) {
      setAuthInterceptor(sessionStorage.getItem("accessToken"));

      if (sessionData?.user?._id) {
        AuthServices.getUserInfro(sessionData.user._id)
          .then((userInfo) => {
            setUser(userInfo);
          })
          .catch((error) => {
            console.error("Error fetching user info:", error);
          });
      }
    }
    setLoading(false);
  }, [sessionData?.user?._id, setUser, user]);

  useEffect(() => {
    queryClient.setQueryData(["assets"], assets);
  }, [assets, queryClient]);

  useEffect(() => {
    queryClient.getQueryData(["assets"]);
  }, [queryClient]);

  if (
    loading ||
    isFetchingSettings ||
    isLoadingTeams ||
    isLoadingMembers ||
    isLoadingAssets
  ) {
    return <Loader />;
  }

  return (
    <PageLayout>
      <DashboardLayout>
        <section className="grid grid-cols-2 gap-4 h-1/2">
          <ItemDashboard id="my-assets">
            {assets.length > 0 ? (
              <MyAssets assets={assets} sessionData={sessionData} />
            ) : (
              <EmptyDashboardCard type="stock" />
            )}
          </ItemDashboard>

          <ItemDashboard id="computer-updates">
            {assets.length > 0 ? (
              <ComputerUpdates assets={assets} user={user} />
            ) : (
              <EmptyDashboardCard type="computer" />
            )}
          </ItemDashboard>
        </section>

        <section className="grid grid-cols-2 gap-4 h-1/2">
          <ItemDashboard id="upcoming-birthdays">
            {membersData.length > 0 ? (
              <UpcomingBirthdays
                membersData={membersData}
                user={user}
                setAlert={setAlert}
              />
            ) : (
              <EmptyDashboardCard type="members" />
            )}
          </ItemDashboard>

          <ItemDashboard id="members-by-country">
            {membersData.length > 0 ? (
              <MembersByCountry membersData={membersData} />
            ) : (
              <EmptyDashboardCard type="opsByCountry" />
            )}
          </ItemDashboard>
        </section>
      </DashboardLayout>
    </PageLayout>
  );
});

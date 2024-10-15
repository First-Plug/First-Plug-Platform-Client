"use client";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models";
import { EmptyDashboardCard, PageLayout, ShopIcon } from "@/common";
import { Card, StockCard, TeamHomeCard } from "@/components";
import { useEffect, useState } from "react";
import useFetch from "@/hooks/useFetch";
import { UserServices } from "@/services/user.services";
import { setAuthInterceptor } from "@/config/axios.config";
import { useFetchTeams } from "@/teams/hooks";
import { useFetchMembers } from "@/members/hooks";
import { BarLoader } from "@/components/Loader/BarLoader";
import { useGetTableAssets } from "@/assets/hooks";
import { Loader } from "@/components/Loader";

export default observer(function Dashboard() {
  const {
    alerts: { setAlert },
    user: { user },
  } = useStore();

  const { data: membersData, isLoading: isLoadingTeams } = useFetchMembers();
  const { data: teamsData, isLoading: isLoadingMembers } = useFetchTeams();
  const { data: assets, isLoading: isLoadingAssets } = useGetTableAssets();

  if (isLoadingTeams || isLoadingMembers || isLoadingAssets) {
    return <Loader />;
  }

  const handleBirthdayGiftClick = async () => {
    try {
      await UserServices.notifyBirthdayGiftInterest(
        user.email,
        user.tenantName
      );
      setAlert("birthdayGiftAlert");
    } catch (error) {
      console.error("Failed to send Slack message:", error);
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-4 w-full h-full  ">
        <section className="grid grid-cols-2 gap-4 h-1/2 ">
          {assets.length ? (
            <Card
              Title="My Assets"
              titleButton="Shop Now"
              icon={<ShopIcon />}
              onClick={() => {
                window.location.href = "/shop";
              }}
            >
              <StockCard products={assets} />
            </Card>
          ) : (
            <EmptyDashboardCard type="stock" />
          )}
          <EmptyDashboardCard type="computer" />
        </section>
        <section className="grid grid-cols-2 gap-4 h-1/2  ">
          {membersData.length ? (
            <>
              <Card
                Title="Upcoming Birthdays"
                titleButton="Birthday Gifts"
                icon={<ShopIcon />}
                onClick={() => {
                  handleBirthdayGiftClick();
                }}
              >
                <TeamHomeCard members={membersData} />
              </Card>
            </>
          ) : (
            <EmptyDashboardCard type="members" />
          )}
          <EmptyDashboardCard type="recentActivity" />
        </section>
      </div>
    </PageLayout>
  );
});

"use client";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models";
import { EmptyDashboardCard, PageLayout, ShopIcon } from "@/common";
import { Card, StockCard, TeamHomeCard } from "@/components";
import { UserServices } from "@/services/user.services";
import { useFetchTeams } from "@/teams/hooks";
import { useFetchMembers } from "@/members/hooks";
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

  // console.log("Members Data:", membersData);
  // console.log("Teams Data:", teamsData);
  // console.log("Assets Data:", assets);

  if (isLoadingTeams || isLoadingMembers || isLoadingAssets) {
    return <Loader />;
  }

  // const areAssetsAvailable =
  //   assets && Array.isArray(assets) && assets.length > 0;
  // const areMembersAvailable =
  //   Array.isArray(membersData) && membersData.length > 0;

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
          {Array.isArray(assets) && assets.length > 0 ? (
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
          {Array.isArray(membersData) && membersData.length > 0 ? (
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
          ) : (
            <EmptyDashboardCard type="members" />
          )}
          <EmptyDashboardCard type="recentActivity" />
        </section>
      </div>
    </PageLayout>
  );
});

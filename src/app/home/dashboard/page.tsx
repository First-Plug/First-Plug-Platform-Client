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
import { setAuthInterceptor } from "@/config/axios.config";
import { CATALOGO_FIRST_PLUG } from "@/config/constanst";
import { useSession } from "next-auth/react";
import { ComputerUpdateCard } from "@/components/Dashboard/ComputerUpdateCard";
import ComputerAgeChart from "@/components/Dashboard/ComputerAgeChart";
import { getBarColor } from "@/components/Dashboard/GetBarColor";
import { AuthServices } from "@/services";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchUserSettings } from "@/components/settings/hooks/useFetchUserSettings";
import OpsByCountryChart from "@/common/OpsByCountryChart";

export default observer(function Dashboard() {
  const {
    alerts: { setAlert },
    user: { user, setUser },
  } = useStore();
  const { data: sessionData } = useSession();
  const [loading, setLoading] = useState(true);
  const [avgAge, setAvgAge] = useState<number>(0);

  const queryClient = useQueryClient();

  const { data: userSettings, isFetching: isFetchingSettings } =
    useFetchUserSettings(user?.tenantName);
  const { data: membersData, isLoading: isLoadingTeams } = useFetchMembers();
  const { data: teamsData, isLoading: isLoadingMembers } = useFetchTeams();
  const { data: assets, isLoading: isLoadingAssets } = useGetTableAssets();

  useEffect(() => {
    queryClient.setQueryData(["assets"], assets);
  }, [assets, queryClient]);

  useEffect(() => {
    queryClient.getQueryData(["assets"]);
  }, [queryClient]);

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

  if (
    loading ||
    isFetchingSettings ||
    isLoadingTeams ||
    isLoadingMembers ||
    isLoadingAssets
  ) {
    return <Loader />;
  }

  const handleAvgAgeCalculated = (calculatedAvgAge: number) => {
    setAvgAge(calculatedAvgAge);
  };

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
                window.open(CATALOGO_FIRST_PLUG, "_blank");
                UserServices.notifyShop(
                  sessionData?.user.email,
                  sessionData?.user.tenantName
                );
              }}
            >
              <StockCard products={assets} />
            </Card>
          ) : (
            <EmptyDashboardCard type="stock" />
          )}

          {assets.length ? (
            <Card
              Title="Computer Updates"
              RightContent={
                <ComputerAgeChart
                  products={assets}
                  onAvgAgeCalculated={handleAvgAgeCalculated}
                  computerExpiration={user?.computerExpiration}
                />
              }
              FooterContent={
                <p className="text-dark-grey font-medium text-sm">
                  Avg computer age:{" "}
                  <span
                    style={{
                      backgroundColor: getBarColor(
                        avgAge,
                        user?.computerExpiration,
                        avgAge
                      ),
                      color: "black",
                      padding: "0 4px",
                      borderRadius: "4px",
                    }}
                  >
                    {avgAge.toFixed(2)} years
                  </span>
                </p>
              }
            >
              <ComputerUpdateCard
                products={assets}
                computerExpiration={user?.computerExpiration}
              />
            </Card>
          ) : (
            <EmptyDashboardCard type="computer" />
          )}
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
          {/* <EmptyDashboardCard type="recentActivity" /> */}
          {Array.isArray(membersData) && membersData.length > 0 ? (
            <Card Title="Members By Country">
              <OpsByCountryChart members={membersData} />
            </Card>
          ) : (
            <EmptyDashboardCard type="opsByCountry" />
          )}
        </section>
      </div>
    </PageLayout>
  );
});

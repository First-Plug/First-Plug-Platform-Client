"use client";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models";
import {
  EmptyDashboardCard,
  NotificationIcon,
  PageLayout,
  ShopIcon,
} from "@/common";
import { Card, StockCard, TeamHomeCard } from "@/components";
import { useEffect, useState } from "react";
import useFetch from "@/hooks/useFetch";
import { UserServices } from "@/services/user.services";
import { GetServerSideProps } from "next";
import { Memberservices, ProductServices } from "@/services";
import { setAuthInterceptor } from "@/config/axios.config";

export default observer(function Dashboard() {
  const {
    members: { members },
    products: { tableProducts },
    alerts: { setAlert },
    user: { user },
  } = useStore();
  const { fetchStock, fetchMembers, fetchMembersAndTeams } = useFetch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("accessToken")) {
      setAuthInterceptor(sessionStorage.getItem("accessToken"));
      if (!members.length) {
        fetchMembersAndTeams();
      }
      if (!tableProducts.length) {
        fetchStock();
      }
    }
    setLoading(false);
  }, [fetchStock, fetchMembers]);

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
        <section className="grid grid-cols-2 gap-4 h-full w-full ">
          {tableProducts.length ? (
            <Card
              Title="My Assets"
              titleButton="Shop Now"
              icon={<ShopIcon />}
              onClick={() => {
                window.location.href = "/shop";
              }}
            >
              <StockCard products={tableProducts} />
            </Card>
          ) : (
            <EmptyDashboardCard type="stock" />
          )}
          {members.length ? (
            <>
              <Card
                Title="Upcoming Birthdays"
                titleButton="Birthday Gifts"
                icon={<ShopIcon />}
                onClick={() => {
                  handleBirthdayGiftClick();
                }}
              >
                <TeamHomeCard />
              </Card>
            </>
          ) : (
            <EmptyDashboardCard type="members" />
          )}
        </section>
        <section className="grid grid-cols-2 gap-4  max-h-1/2 h-1/2  ">
          <Card Title="Notifications">
            <section className="  h-full flex flex-col justify-center items-center">
              <h1 className="flex  items-center font-montserrat text-2xl font-bold text-black  gap-2">
                Coming Soon!
                <NotificationIcon />
              </h1>
              <p className="font-inter text-sm text-dark-grey mb-[1.5rem] mt-[1rem]">
                We&apos;re excited to reveal that the Firstplug notifications
                are coming soon!
              </p>
            </section>
          </Card>
          <Card Title="Notifications">
            <section className="  h-full flex flex-col justify-center items-center">
              <h1 className="flex  items-center font-montserrat text-2xl font-bold text-black  gap-2">
                Coming Soon!
                <NotificationIcon />
              </h1>
              <p className="font-inter text-sm text-dark-grey mb-[1.5rem] mt-[1rem]">
                We&apos;re excited to reveal that the Firstplug notifications
                are coming soon!
              </p>
            </section>
          </Card>
        </section>
      </div>
    </PageLayout>
  );
});

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const [membersResponse, stockResponse] = await Promise.all([
      Memberservices.getAllMembers(),
      ProductServices.getTableFormat(),
    ]);

    return {
      props: {
        membersData: membersResponse,
        stockData: stockResponse,
      },
    };
  } catch (error) {
    console.error("Error fetching data on server:", error);
    return {
      props: {
        membersData: [],
        stockData: [],
      },
    };
  }
};

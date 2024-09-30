"use client";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models";
import {
  CustomLink,
  EmptyDashboardCard,
  NotificationIcon,
  PageLayout,
  ShopIcon,
} from "@/common";
import { Card, StockCard, TeamHomeCard } from "@/components";
import { useEffect } from "react";
import useFetch from "@/hooks/useFetch";

export default observer(function Dashboard() {
  const {
    members: { members },
    products: { tableProducts },
  } = useStore();
  const { fetchStock } = useFetch();

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  return (
    <PageLayout>
      <div className="flex flex-col gap-4 w-full h-full max-h-full  ">
        <section className="grid grid-cols-2 gap-4  max-h-1/2 h-1/2  ">
          {tableProducts.length ? (
            <Card
              Title="My Assets"
              titleButton="Shop Now"
              icon={
                <CustomLink href="/shop" className="flex items-center gap-2">
                  <ShopIcon />
                </CustomLink>
              }
            >
              <StockCard products={tableProducts} />
            </Card>
          ) : (
            <EmptyDashboardCard type="stock" />
          )}
          {members.length ? (
            <TeamHomeCard />
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
                We`re excited to reveal that the Firstplug notifications are
                coming soon!
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
                We`re excited to reveal that the Firstplug notifications are
                coming soon!
              </p>
            </section>
          </Card>
        </section>
      </div>
    </PageLayout>
  );
});

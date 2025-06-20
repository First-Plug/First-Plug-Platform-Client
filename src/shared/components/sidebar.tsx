"use client";
import React, { useState } from "react";
import Image from "next/image";

import { SidebarLink } from "@/shared";

import {
  Button,
  ComputerIcon,
  PersonsGroupIcon,
  SettingsIcon,
  ArrowLeft,
  ArrowRight,
  DashboardIcon,
  ClockIcon,
  TruckIcon,
} from "@/shared";
import { usePathname } from "next/navigation";
// import { usePrefetchAssets } from "@/assets/hooks";
import { usePrefetchMembers } from "@/features/members";
import { usePrefetchLatestActivity } from "@/features/activity";
import Link from "next/link";

export const Sidebar = () => {
  const path = usePathname();
  const pathArray = path.split("/");
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [isSidebarSmall, setIsSidebarSmall] = useState<boolean>(false);

  // const { prefetchAssets } = usePrefetchAssets();
  const prefetchMembers = usePrefetchMembers();
  const prefetchLatestActivity = usePrefetchLatestActivity();

  const toggleSidebarSize = () => {
    setIsSidebarSmall(!isSidebarSmall);
    setShowLogo(!showLogo);
  };

  return (
    <aside
      className={` min-h-screen  flex flex-col shadow-sm shadow-grey transition-all ${
        isSidebarSmall ? "w-20" : "w-64"
      }`}
    >
      <header className={`py-8 flex flex-[-1] h-[8vh] mx-6`}>
        <div>
          <Link href="/home/dashboard">
            {isSidebarSmall ? (
              <Image
                src="/Isotipo.png"
                alt="Logo small"
                width={280}
                height={98}
                className="w-10"
              />
            ) : (
              <Image
                src="/logo1.png"
                alt="Logo"
                width={144.2}
                height={48}
                priority
              />
            )}
          </Link>
        </div>
      </header>

      <div className="h-5">
        <hr />

        <Button
          icon={
            isSidebarSmall ? (
              <ArrowRight color="grey" strokeWidth={2.5} />
            ) : (
              <ArrowLeft color="grey" strokeWidth={2.5} />
            )
          }
          onClick={toggleSidebarSize}
          variant="outline"
          className={`w-10 h-10 bg-white border border-grey rounded-full  relative bottom-5 ${
            isSidebarSmall ? "left-[70%]" : "left-[90%]"
          }`}
        />
      </div>

      <section className="flex flex-col flex-[2] gap-4">
        <SidebarLink
          isSmall={isSidebarSmall}
          icon={<DashboardIcon />}
          title="Dashboard"
          href="/home/dashboard"
          isActive={pathArray.includes("dashboard")}
          onMouseEnter={() => {
            prefetchMembers();
            // prefetchAssets();
          }}
        />
        <SidebarLink
          isSmall={isSidebarSmall}
          icon={<PersonsGroupIcon />}
          title="My Team"
          href="/home/my-team"
          isActive={pathArray.includes("my-team")}
          onMouseEnter={() => {
            prefetchMembers();
          }}
        />

        <SidebarLink
          isSmall={isSidebarSmall}
          icon={<ComputerIcon />}
          title="My Assets"
          href="/home/my-stock"
          isActive={pathArray.includes("my-stock")}
          onMouseEnter={() => {
            // prefetchAssets();
          }}
        />

        <SidebarLink
          isSmall={isSidebarSmall}
          icon={<TruckIcon />}
          title="Shipments"
          href="/home/shipments"
          isActive={pathArray.includes("shipments")}
        />

        <SidebarLink
          isSmall={isSidebarSmall}
          icon={<ClockIcon />}
          title="Activity"
          href="/home/activity"
          isActive={pathArray.includes("activity")}
          onMouseEnter={() => {
            prefetchLatestActivity();
          }}
        />

        {/* <SidebarLink
          isSmall={isSidebarSmall}
          icon={<NotebookOrdersIcon />}
          title="Orders"
          href="/orders"
          isActive={pathArray.includes("orders")}
        /> */}
      </section>

      <hr className="my-2" />

      <section className="flex flex-col flex-[-1] gap-4 my-4 h-12">
        <SidebarLink
          isSmall={isSidebarSmall}
          icon={<SettingsIcon />}
          title="Settings"
          href="/home/settings"
          isActive={pathArray.includes("settings")}
          onMouseEnter={() => {
            // prefetchAssets();
          }}
        />
      </section>
    </aside>
  );
};

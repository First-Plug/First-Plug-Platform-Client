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
  WarehouseIcon,
  BuildingIcon,
} from "@/shared";
import { usePathname } from "next/navigation";
import { usePrefetchAssets } from "@/features/assets";
import { usePrefetchMembers } from "@/features/members";
import { usePrefetchLatestActivity } from "@/features/activity";
import Link from "next/link";
import { usePrefetchShipments } from "@/features/shipments";
import { useLogisticUser } from "@/shared/hooks/useLogisticUser";
import { UserPlusIcon, UsersIcon, Warehouse, PlusIcon } from "lucide-react";

export const Sidebar = () => {
  const path = usePathname();
  const pathArray = path.split("/");
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [isSidebarSmall, setIsSidebarSmall] = useState<boolean>(false);

  const { prefetchAssets } = usePrefetchAssets();
  const prefetchMembers = usePrefetchMembers();
  const prefetchLatestActivity = usePrefetchLatestActivity();
  const { prefetchShipments } = usePrefetchShipments();
  const { isLogisticUser } = useLogisticUser();

  const toggleSidebarSize = () => {
    setIsSidebarSmall(!isSidebarSmall);
    setShowLogo(!showLogo);
  };

  return (
    <aside
      className={`min-h-screen flex flex-col shadow-sm shadow-grey transition-all duration-300 ease-in-out ${
        isSidebarSmall ? "w-20" : "w-64"
      }`}
    >
      <header className={`py-8 flex flex-[-1] h-[8vh] mx-6 overflow-hidden`}>
        <div className="flex justify-center items-center w-full">
          <Link
            href="/home/dashboard"
            className="flex justify-center items-center"
          >
            <div className="relative flex justify-center items-center w-full h-full">
              <div
                className={`flex items-center justify-center transition-all duration-300 ease-in-out ${
                  isSidebarSmall
                    ? "opacity-0 scale-75 absolute"
                    : "opacity-100 scale-100"
                }`}
              >
                <Image
                  src="/logo1.png"
                  alt="Logo"
                  width={144}
                  height={48}
                  priority
                  className="object-contain"
                  style={{
                    width: "144px",
                    height: "48px",
                  }}
                />
              </div>
              <div
                className={`flex items-center justify-center transition-all duration-300 ease-in-out ${
                  isSidebarSmall
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-75 absolute"
                }`}
              >
                <Image
                  src="/Isotipo.png"
                  alt="Logo small"
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                />
              </div>
            </div>
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
          className={`w-10 h-10 bg-white border border-grey rounded-full relative bottom-5 transition-all duration-300 ease-in-out ${
            isSidebarSmall ? "left-[70%]" : "left-[90%]"
          }`}
        />
      </div>

      <section className="flex flex-col flex-[2] gap-4">
        {isLogisticUser ? (
          <>
            <SidebarLink
              isSmall={isSidebarSmall}
              icon={<WarehouseIcon />}
              title="Logistics"
              href="/home/logistics"
              isActive={pathArray.includes("logistics")}
              onMouseEnter={() => {}}
            />
            <SidebarLink
              isSmall={isSidebarSmall}
              icon={<UsersIcon />}
              title="Unassigned Users"
              href="/home/unassigned-users"
              isActive={pathArray.includes("unassigned-users")}
              onMouseEnter={() => {
                // prefetchAssets();
              }}
            />
            <SidebarLink
              isSmall={isSidebarSmall}
              icon={<UserPlusIcon />}
              title="Assigned Users"
              href="/home/assigned-users"
              isActive={pathArray.includes("assigned-users")}
              onMouseEnter={() => {
                // prefetchAssets();
              }}
            />
            <SidebarLink
              isSmall={isSidebarSmall}
              icon={<BuildingIcon />}
              title="Tenants"
              href="/home/tenants"
              isActive={pathArray.includes("tenants")}
              onMouseEnter={() => {
                // prefetchAssets();
              }}
            />

            <SidebarLink
              isSmall={isSidebarSmall}
              icon={<Warehouse />}
              title="Warehouses"
              href="/home/warehouses"
              isActive={pathArray.includes("warehouses")}
              onMouseEnter={() => {
                // prefetchAssets();
              }}
            />

            <SidebarLink
              isSmall={isSidebarSmall}
              icon={<PlusIcon />}
              title="Create"
              href="/home/create"
              isActive={pathArray.includes("create")}
              onMouseEnter={() => {
                // prefetchAssets();
              }}
            />
          </>
        ) : (
          <>
            <SidebarLink
              isSmall={isSidebarSmall}
              icon={<DashboardIcon />}
              title="Dashboard"
              href="/home/dashboard"
              isActive={pathArray.includes("dashboard")}
              onMouseEnter={() => {
                prefetchMembers();
                prefetchAssets();
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
                prefetchAssets();
              }}
            />

            <SidebarLink
              isSmall={isSidebarSmall}
              icon={<BuildingIcon />}
              title="Offices"
              href="/home/offices"
              isActive={pathArray.includes("offices")}
              onMouseEnter={() => {}}
            />

            <SidebarLink
              isSmall={isSidebarSmall}
              icon={<TruckIcon />}
              title="Shipments"
              href="/home/shipments"
              isActive={pathArray.includes("shipments")}
              onMouseEnter={() => {
                prefetchShipments();
              }}
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
          </>
        )}
      </section>

      {!isLogisticUser && (
        <>
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
        </>
      )}
    </aside>
  );
};

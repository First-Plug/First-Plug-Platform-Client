"use client";
import React from "react";
import { Button, SearchInput, SessionDropdown, ImageProfile } from "@/shared";
import Image from "next/image";
import Logo from "/public/logo1.png";
import { ShopIcon } from "@/shared";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { CATALOGO_FIRST_PLUG } from "@/config/constanst";
import { UserServices } from "@/features/settings";
import { useMemberStore } from "@/features/members";

type NavbarProps = {
  title?: string;
  searchInput?: string;
  placeholder?: string;
};
const Titles = {
  "my-stock": "My Assets",
  "my-team": "My Team",
  activity: "Activity",
  orders: "Orders",
  shipments: "Shipments",
  logistics: "Logistics",
  "unassigned-users": "Unassigned Users",
  "assigned-users": "Assigned Users",
  tenants: "Tenants",
  warehouses: "Warehouses",
  create: "Create Product",
  offices: "Offices",
  "new-request": "New Quote Request",
} as const;

export const Navbar = ({ title, searchInput, placeholder }: NavbarProps) => {
  const pathName = usePathname();
  const { status, data } = useSession();
  const pathArray = pathName.split("/");

  const { memberOffBoarding } = useMemberStore();

  const getTitle = () => {
    if (pathArray[3] === "request-off-boarding") {
      return memberOffBoarding ? memberOffBoarding : "";
    }
    // Verificar si la ruta incluye "new-request"
    if (pathArray.includes("new-request")) {
      return Titles["new-request"] ?? "";
    }
    return Titles[pathArray[2] as keyof typeof Titles] ?? "";
  };

  return (
    <nav className="flex justify-between items-center px-4 h-[10vh] min-h-[10vh] max-h-[10vh]">
      <div className="flex items-center gap-6">
        {title === "logo" ? (
          <Image src={Logo} alt="Logo" width={140} height={300} priority />
        ) : (
          <h2 className="font-bold text-black text-2xl">{getTitle()}</h2>
        )}

        {searchInput && <SearchInput placeholder={placeholder} />}
      </div>
      {status === "authenticated" && (
        <div className="flex justify-end items-center gap-2">
          <div>
            <Button
              icon={<ShopIcon />}
              body={"Shop"}
              variant={"text"}
              className={"py-2 px-4 bg-none text-sm"}
              onClick={() => {
                const {
                  user: { email, tenantName },
                } = data;

                window.open(CATALOGO_FIRST_PLUG, "_blank");
                UserServices.notifyShop(email, tenantName);
              }}
            />
          </div>
          <div className="flex items-center gap-2 hover:bg-light-grey rounded-md">
            <div className="relative w-10 h-10">
              <ImageProfile />
            </div>
            <SessionDropdown />
          </div>
        </div>
      )}
    </nav>
  );
};

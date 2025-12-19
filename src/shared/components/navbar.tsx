"use client";
import React from "react";
import {
  Button,
  SearchInput,
  SessionDropdown,
  ImageProfile,
  ArrowLeft,
} from "@/shared";
import Image from "next/image";
import Logo from "/public/logo1.png";
import { ShopIcon } from "@/shared";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";

import { CATALOGO_FIRST_PLUG } from "@/config/constanst";
import { UserServices } from "@/features/settings";
import { useMemberStore } from "@/features/members";
import { useQuoteStore } from "@/features/quotes";

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
  const { isAddingProduct, currentStep, onBack, onCancel, editingProductId } =
    useQuoteStore();

  const getStepTitle = (step: number) => {
    const stepTitles: Record<number, string> = {
      1: "Select Product Category",
      2: "Select Operating System",
      3: "Technical Specifications",
      4: "Quote Details",
    };
    return stepTitles[step] || "";
  };

  const getTitle = () => {
    if (pathArray[3] === "request-off-boarding") {
      return memberOffBoarding ? memberOffBoarding : "";
    }
    // Verificar si la ruta incluye "new-request" y si está en modo agregar producto
    if (pathArray.includes("new-request") && isAddingProduct) {
      return getStepTitle(currentStep);
    }
    // Verificar si la ruta incluye "new-request"
    if (pathArray.includes("new-request")) {
      return Titles["new-request"] ?? "";
    }
    return Titles[pathArray[2] as keyof typeof Titles] ?? "";
  };

  // Si está en el flujo de add product, mostrar header dinámico
  if (pathArray.includes("new-request") && isAddingProduct) {
    return (
      <nav className="flex justify-between items-center px-4 border-b h-[10vh] min-h-[10vh] max-h-[10vh]">
        <div className="flex items-center gap-4">
          {/* Si estamos editando, solo mostrar back si estamos en step 3 o 4 (no en step 2) */}
          {onBack &&
            ((editingProductId && currentStep > 2) ||
              (!editingProductId && currentStep > 1)) && (
              <button
                type="button"
                onClick={onBack}
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          <div className={currentStep === 1 ? "pl-4" : ""}>
            <h2 className="font-semibold text-black text-2xl">
              {getStepTitle(currentStep)}
            </h2>
            <p className="text-muted-foreground text-sm">
              Step {currentStep} of 4
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </nav>
    );
  }

  // Navbar normal
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

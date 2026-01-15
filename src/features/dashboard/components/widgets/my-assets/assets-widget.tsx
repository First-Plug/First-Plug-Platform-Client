"use client";
import { useRouter } from "next/navigation";
import { StockCard } from "@/features/dashboard";
import { Card, EmptyDashboardCard, ShopIcon } from "@/shared";
import { UserServices } from "@/features/settings";

import type { ProductTable } from "@/features/assets";
import { LoggedInUser } from "@/features/auth";

interface Props {
  assets: ProductTable[];
  user: LoggedInUser;
}

export const AssetsWidget = ({ assets, user }: Props) => {
  const router = useRouter();

  if (assets.length === 0) {
    return <EmptyDashboardCard type="stock" handleSwapy />;
  }

  return (
    <Card
      className="bg-white h-full"
      Title="My Assets"
      handleSwapy
      titleButton="Shop Now"
      icon={<ShopIcon />}
      onClick={() => {
        router.push("/home/quotes/new-request");
        UserServices.notifyShop(user.email, user.tenantName);
      }}
    >
      <StockCard products={assets} />
    </Card>
  );
};

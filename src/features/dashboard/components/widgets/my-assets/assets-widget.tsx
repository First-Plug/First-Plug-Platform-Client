import { CATALOGO_FIRST_PLUG } from "@/config/constanst";
import { StockCard } from "@/features/dashboard";
import { Card, EmptyDashboardCard, ShopIcon } from "@/shared";
import { UserServices } from "@/services/user.services";

import type { ProductTable } from "@/features/assets";
import { LoggedInUser } from "@/features/auth";

interface Props {
  assets: ProductTable[];
  user: LoggedInUser;
}

export const AssetsWidget = ({ assets, user }: Props) => {
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
        window.open(CATALOGO_FIRST_PLUG, "_blank");
        UserServices.notifyShop(user.email, user.tenantName);
      }}
    >
      <StockCard products={assets} />
    </Card>
  );
};

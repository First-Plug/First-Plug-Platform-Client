import { Card, StockCard } from "@/components";
import { ShopIcon } from "@/common";
import { UserServices } from "@/services/user.services";
import { CATALOGO_FIRST_PLUG } from "@/config/constanst";

export const MyAssets = ({ assets, sessionData }) => (
  <Card
    className="h-full bg-white"
    Title="My Assets"
    handleSwapy
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
);

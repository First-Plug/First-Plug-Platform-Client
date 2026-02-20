import { AddIcon, Button, ShopIcon, UploadIcon, DownloadIcon } from "@/shared";

import { useRouter } from "next/navigation";
import { UserServices } from "@/features/settings";
import { useSession } from "next-auth/react";
import { useAsideStore } from "@/shared";
import {
  useProductStore,
  ProductServices,
  CountryFilter,
  SerialFilter,
} from "@/features/assets";

export const TableStockActions = () => {
  const router = useRouter();
  const { setAside } = useAsideStore();

  const handleExportCsv = async () => {
    try {
      await ProductServices.exportProductsCsv();
    } catch (error) {
      // Error silenciado
    }
  };

  const { data } = useSession();

  return (
    <div className="flex justify-between items-center w-full flex-1">
      <div className="flex items-center gap-4">
        <CountryFilter />
        <SerialFilter />
      </div>
      <div className="flex gap-2">
        <Button
          size="small"
          variant="secondary"
          body="Add Product"
          icon={<AddIcon />}
          onClick={() => {
            router.push("/home/my-stock/add");
          }}
        />

        <Button
          size="small"
          variant="secondary"
          icon={<DownloadIcon />}
          body="Export My Assets"
          onClick={handleExportCsv}
        />

        <Button
          size="small"
          variant="secondary"
          body="Load Assets"
          icon={<UploadIcon />}
          onClick={() => setAside("LoadStock")}
        />

        <Button
          size="small"
          variant="primary"
          icon={<ShopIcon />}
          body="Shop Now"
          onClick={() => {
            const {
              user: { email, tenantName },
            } = data;

            router.push("/home/quotes/new-request");
            UserServices.notifyShop(email, tenantName);
          }}
        />
      </div>
    </div>
  );
};

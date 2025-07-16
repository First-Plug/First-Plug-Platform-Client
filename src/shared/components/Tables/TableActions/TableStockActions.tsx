import { AddIcon, Button, ShopIcon, UploadIcon, DownloadIcon } from "@/shared";

import { useRouter } from "next/navigation";
import { CATALOGO_FIRST_PLUG } from "@/config/constanst";
import { UserServices } from "@/features/settings";
import { useSession } from "next-auth/react";
import { useAsideStore } from "@/shared";
import { useProductStore, ProductServices } from "@/features/assets";

export default function TableStockActions() {
  const router = useRouter();
  const { setAside } = useAsideStore();

  const handleFilter = () => setOnlyAvailable(!onlyAvailable);

  const handleExportCsv = async () => {
    try {
      await ProductServices.exportProductsCsv();
    } catch (error) {
      console.error("Failed to export products CSV:", error);
    }
  };

  const { data } = useSession();

  const { setOnlyAvailable, onlyAvailable } = useProductStore();

  return (
    <div className="flex justify-between items-center w-full h-full">
      <div className="flex gap-1">
        <input
          id="onlyAvailable"
          type="checkbox"
          checked={onlyAvailable}
          onChange={handleFilter}
        />
        <label htmlFor="onlyAvailable" className="text-gray-500 text-md">
          Show only available products
        </label>
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

            window.open(CATALOGO_FIRST_PLUG, "_blank");
            UserServices.notifyShop(email, tenantName);
          }}
        />
      </div>
    </div>
  );
}

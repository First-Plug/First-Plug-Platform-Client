import { AddIcon, Button, ShopIcon, UploadIcon, DownloadIcon } from "@/shared";
import { useRouter } from "next/navigation";
import { UserServices } from "@/features/settings";
import { useSession } from "next-auth/react";
import { useAsideStore } from "@/shared";
import { ProductServices } from "@/features/assets";

export const TableStockButtons = () => {
  const router = useRouter();
  const { setAside } = useAsideStore();
  const { data } = useSession();

  const handleExportCsv = async () => {
    try {
      await ProductServices.exportProductsCsv();
    } catch {
      // Error silenciado
    }
  };

  return (
    <div className="flex gap-2 flex-shrink-0">
      <Button
        size="small"
        variant="secondary"
        body="Add Product"
        icon={<AddIcon />}
        onClick={() => router.push("/home/my-stock/add")}
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
          const { user: { email, tenantName } } = data ?? {};
          if (email && tenantName) {
            router.push("/home/quotes/new-request");
            UserServices.notifyShop(email, tenantName);
          }
        }}
      />
    </div>
  );
};

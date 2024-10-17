import { useEffect, useState } from "react";
import ProgressCircle from "./ProgressCircle";
import { ComputerUpgradeTable } from "./ComputerUpgradeTable";
import { useStore } from "@/models";

interface ComputerUpdateCardProps {
  products: any[];
}

export const ComputerUpdateCard = ({ products }: ComputerUpdateCardProps) => {
  const {
    user: { user },
    alerts: { setAlert },
  } = useStore();

  const [productsWithDate, setProductsWithDate] = useState<number>(0);
  const [productsWithoutDate, setProductsWithoutDate] = useState<number>(0);
  const [computersToUpgrade, setComputersToUpgrade] = useState<any[]>([]);

  useEffect(() => {
    const realProducts = products.flatMap((category) => category.products);

    const totalWithDate = realProducts.filter(
      (product) => product.acquisitionDate && product.acquisitionDate !== ""
    ).length;
    const totalProducts = realProducts.length;
    const totalWithoutDate = totalProducts - totalWithDate;

    setProductsWithDate(totalWithDate);
    setProductsWithoutDate(totalWithoutDate);

    const computersNeedingUpgrade = realProducts.filter((product) => {
      const acquisitionDate = new Date(product.acquisitionDate);
      const yearsSinceAcquisition =
        (Date.now() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

      return yearsSinceAcquisition >= 2.5; // 2.5 años o más
    });

    setComputersToUpgrade(computersNeedingUpgrade);
  }, [products]);

  return (
    <div className="flex flex-col items-start">
      <div className="mb-4">
        <ProgressCircle
          productsWithDate={productsWithDate}
          productsWithoutDate={productsWithoutDate}
        />
      </div>
      {computersToUpgrade.length > 0 ? (
        <div className="w-full mt-4">
          <ComputerUpgradeTable
            products={computersToUpgrade}
            email={user.email}
            tenantName={user.tenantName}
            alert={setAlert}
          />
        </div>
      ) : (
        <p className="text-sm text-green-500 font-medium">
          All computers are up to date. No upgrades required at the moment.
        </p>
      )}
    </div>
  );
};

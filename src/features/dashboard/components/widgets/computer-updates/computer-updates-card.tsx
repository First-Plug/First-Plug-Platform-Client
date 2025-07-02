import { useEffect, useState } from "react";

import { ProgressCircle, ComputerUpgradeTable } from "@/features/dashboard";

import { UserServices } from "@/features/settings";

import type { ProductTable } from "@/features/assets";
import { useAlertStore } from "@/shared";
import { useSession } from "next-auth/react";

interface ComputerUpdateCardProps {
  products: ProductTable[];
  computerExpiration: number | undefined;
}

interface ComputerStatus {
  brandModel: string;
  serial: string;
  yearsSinceAcquisition: number;
  status: string;
  location: string;
}

export const ComputerUpdateCard = ({
  products,
  computerExpiration,
}: ComputerUpdateCardProps) => {
  const { setAlert } = useAlertStore();

  const {
    data: { user },
  } = useSession();

  const [productsWithDate, setProductsWithDate] = useState<number>(0);
  const [productsWithoutDate, setProductsWithoutDate] = useState<number>(0);
  const [computersToUpgrade, setComputersToUpgrade] = useState<any[]>([]);

  useEffect(() => {
    const realProducts = products
      .flatMap((category) => category.products)
      .filter((product) => product.category === "Computer");

    const totalWithDate = realProducts.filter(
      (product) => product.acquisitionDate && product.acquisitionDate !== ""
    ).length;
    const totalProducts = realProducts.length;
    const totalWithoutDate = totalProducts - totalWithDate;

    setProductsWithDate(totalWithDate);
    setProductsWithoutDate(totalWithoutDate);

    const computersNeedingUpgrade = realProducts.filter((product) => {
      const acquisitionDate = product.acquisitionDate
        ? new Date(product.acquisitionDate)
        : null;
      const yearsSinceAcquisition = acquisitionDate
        ? (Date.now() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
        : null;

      const condition = product.productCondition?.toLowerCase() || "optimal";

      return (
        yearsSinceAcquisition >=
          (computerExpiration ? computerExpiration - 0.5 : 0) ||
        condition === "defective" ||
        condition === "unusable"
      );
    });

    setComputersToUpgrade(computersNeedingUpgrade);
  }, [products, computerExpiration]);

  const handleSlackNotification = async (
    product: ComputerStatus,
    email: string,
    tenantName: string
  ) => {
    try {
      const { brandModel, serial, yearsSinceAcquisition, status, location } =
        product;

      await UserServices.notifyComputerUpgrade({
        email,
        tenantName,
        category: "Computer",
        brand: brandModel.split(" ")[0],
        model: brandModel.split(" ").slice(1).join(" "),
        serialNumber: serial,
        acquisitionDate: `${yearsSinceAcquisition} years`,
        status,
        location,
      });

      setAlert("computerUpgradeAlert");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <div className="flex flex-col items-start p-2 h-full">
      <div className="flex-shrink-0 mb-4">
        <ProgressCircle
          productsWithDate={productsWithDate}
          productsWithoutDate={productsWithoutDate}
        />
      </div>

      <div className="flex-grow mt-4 w-full overflow-y-auto scrollbar-custom">
        {computersToUpgrade.length > 0 ? (
          <ComputerUpgradeTable
            products={computersToUpgrade}
            email={user?.email}
            tenantName={user?.tenantName}
            computerExpiration={computerExpiration}
            handleSlackNotification={handleSlackNotification}
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="mt-6 mb-6 text-dark-grey text-md text-center">
              All computers are up to date. No upgrades required at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

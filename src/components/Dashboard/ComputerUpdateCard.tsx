import { useEffect, useState } from "react";
import ProgressCircle from "./ProgressCircle";
import { ComputerUpgradeTable } from "./ComputerUpgradeTable";
import { useStore } from "@/models";
import { UserServices } from "@/services/user.services";

interface ComputerUpdateCardProps {
  products: any[];
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
  const {
    user: { user },
    alerts: { setAlert },
  } = useStore();

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
    <div className="flex flex-col items-start h-full p-2">
      <div className="mb-4 flex-shrink-0">
        <ProgressCircle
          productsWithDate={productsWithDate}
          productsWithoutDate={productsWithoutDate}
        />
      </div>

      <div className="w-full mt-4 flex-grow overflow-y-auto scrollbar-custom ">
        {computersToUpgrade.length > 0 ? (
          <ComputerUpgradeTable
            products={computersToUpgrade}
            email={user?.email}
            tenantName={user?.tenantName}
            computerExpiration={computerExpiration}
            handleSlackNotification={handleSlackNotification}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-dark-grey text-md text-center mt-6 mb-6">
              All computers are up to date. No upgrades required at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

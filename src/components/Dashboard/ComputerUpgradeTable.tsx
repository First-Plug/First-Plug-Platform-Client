import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { BirthdayRoot } from "../Tables/BirthdayRoot";
import { Product, User } from "@/types";
import { UserServices } from "@/services/user.services";

interface ComputerStatus {
  brandModel: string;
  serial: string;
  yearsSinceAcquisition: number;
  status: string;
  location: string;
}

interface ComputerUpgradeTableProps {
  products: Product[];
  email: string;
  tenantName: string;
  alert: (alert: string) => void;
}

const handleSlackNotification = async (
  product: ComputerStatus,
  email: string,
  tenantName: string,
  alert: (alert: string) => void
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

    alert("computerUpgradeAlert");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const getStatus = (years: number) => {
  if (years >= 3) return "Upgrade recommended";
  if (years >= 2.5) return "Time for upgrade";
  return "Ok";
};

const computerColumns = (
  email: string,
  tenantName: string
): ColumnDef<ComputerStatus>[] => [
  {
    id: "brandModel",
    accessorKey: "brandModel",
    size: 250,
    header: "Brand + Model",
    cell: ({ getValue }) => (
      <span className="font-semibold text-blue-500">{getValue<string>()}</span>
    ),
  },
  {
    id: "serial",
    accessorKey: "serial",
    size: 100,
    header: "Serial",
    cell: ({ getValue }) => (
      <span className="font-semibold text-blue-500">{getValue<string>()}</span>
    ),
  },
  {
    id: "yearsSinceAcquisition",
    accessorKey: "yearsSinceAcquisition",
    size: 100,
    header: () => (
      <div className="text-center">
        Years Since <br /> Acquisition
      </div>
    ),
    cell: ({ getValue }) => (
      <span className="font-semibold text-blue-500">
        {getValue<number>().toFixed(1)}
      </span>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    size: 200,
    header: "Status",
    cell: ({ row, getValue }) => {
      const status = getValue<string>();

      return (
        <button
          className={` p-2 font-semibold ${
            status === "Upgrade recommended"
              ? " text-blue hover:bg-hoverBlue rounded-full"
              : status === "Time for upgrade"
              ? " text-blue hover:bg-hoverBlue rounded-full"
              : "bg-green-500"
          }`}
          onClick={() =>
            handleSlackNotification(row.original, email, tenantName, alert)
          }
        >
          {status}
        </button>
      );
    },
  },
  {
    id: "location",
    accessorKey: "location",
    header: "Location",
    cell: ({ getValue }) => (
      <span className="font-semibold text-blue-500">{getValue<string>()}</span>
    ),
  },
];

export const ComputerUpgradeTable = ({
  products,
  email,
  tenantName,
}: ComputerUpgradeTableProps) => {
  const computersWithStatus = useMemo(() => {
    return products
      .filter(
        (product) => product.category === "Computer" && product.acquisitionDate
      )
      .map((product) => {
        const acquisitionDate = new Date(product.acquisitionDate);
        const yearsSinceAcquisition =
          (Date.now() - acquisitionDate.getTime()) /
          (1000 * 60 * 60 * 24 * 365);

        return {
          brandModel: `${
            product.attributes.find((attr) => attr.key === "brand")?.value || ""
          } ${
            product.attributes.find((attr) => attr.key === "model")?.value || ""
          }`,
          serial: product.serialNumber || "N/A",
          yearsSinceAcquisition,
          status: getStatus(yearsSinceAcquisition),
          location: product.location || "Unknown",
        };
      });
  }, [products]);

  return (
    <BirthdayRoot
      columns={computerColumns(email, tenantName)}
      data={computersWithStatus}
    />
  );
};

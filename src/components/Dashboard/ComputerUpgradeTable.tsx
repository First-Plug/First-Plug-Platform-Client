import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { BirthdayRoot } from "../Tables/BirthdayRoot";
import { Product } from "@/types";

interface ComputerStatus {
  brandModel: string;
  serial: string;
  yearsSinceAcquisition: number;
  status: string;
  location: string;
}

interface ComputerUpgradeTableProps {
  products: Product[];
}
const getStatus = (years: number) => {
  if (years >= 3) return "Expired";
  if (years >= 2.5) return "Close to Expire";
  return "Ok";
};

const computerColumns: ColumnDef<ComputerStatus>[] = [
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
    cell: ({ getValue }) => {
      const status = getValue<string>();
      return (
        <button
          className={` p-2 font-semibold ${
            status === "Expired"
              ? " text-blue hover:bg-hoverBlue rounded-full"
              : status === "Close to Expire"
              ? " text-blue hover:bg-hoverBlue rounded-full"
              : "bg-green-500"
          }`}
          //   onClick={() => handleSlackNotification(getValue<string>())}
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

  return <BirthdayRoot columns={computerColumns} data={computersWithStatus} />;
};

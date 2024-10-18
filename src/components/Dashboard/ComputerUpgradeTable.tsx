import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { BirthdayRoot } from "../Tables/BirthdayRoot";
import { Product, User } from "@/types";

interface ComputerStatus {
  brandModel: string;
  serial: string;
  yearsSinceAcquisition: number;
  status: string;
  location: string;
  assignedMember?: string;
}

interface ComputerUpgradeTableProps {
  products: Product[];
  email: string;
  tenantName: string;
  handleSlackNotification: (
    product: ComputerStatus,
    email: string,
    tenantName: string
  ) => Promise<void>;
}

const getStatus = (years: number) => {
  if (years >= 3) return "Upgrade recommended";
  if (years >= 2.5) return "Time for upgrade";
  return "Ok";
};

const computerColumns = (
  email: string,
  tenantName: string,
  handleSlackNotification: (
    product: ComputerStatus,
    email: string,
    tenantName: string
  ) => Promise<void>
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
            handleSlackNotification(row.original, email, tenantName)
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
    cell: ({ row }) => {
      const location = row.original.location;
      const fullName = row.original.assignedMember || "Unknown Member";

      return (
        <span className="font-semibold text-blue-500">
          {location === "Employee" ? fullName : location}
        </span>
      );
    },
  },
];

export const ComputerUpgradeTable = ({
  products,
  email,
  tenantName,
  handleSlackNotification,
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
          location:
            product.location === "Employee"
              ? product.assignedMember || "Unknown"
              : product.location,
          assignedMember: product.assignedMember,
        };
      });
  }, [products]);

  return (
    <BirthdayRoot
      columns={computerColumns(email, tenantName, handleSlackNotification)}
      data={computersWithStatus}
    />
  );
};

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
  assignedMember?: string;
}

interface ComputerUpgradeTableProps {
  products: Product[];
  email: string;
  tenantName: string;
  computerExpiration: number;
  handleSlackNotification: (
    product: ComputerStatus,
    email: string,
    tenantName: string
  ) => Promise<void>;
}

const getStatus = (years: number, computerExpiration: number) => {
  const sixMonthsBeforeExpiration = computerExpiration - 0.5;

  if (years >= computerExpiration) {
    return "Upgrade recommended";
  } else if (years >= sixMonthsBeforeExpiration) {
    return "Time for upgrade";
  } else {
    return "Ok";
  }
};

const computerColumns = (
  email: string,
  tenantName: string,
  computerExpiration: number,
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
    cell: ({ getValue }) => {
      const years = getValue<number>();
      return (
        <span className="font-semibold text-blue-500">
          {years === Infinity ? "N/A" : years.toFixed(1)}
        </span>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    size: 200,
    header: "Status",
    cell: ({ row, getValue }) => {
      const status = getValue<string>();

      return (
        <div className="flex justify-center">
          <button
            className={`p-2 font-semibold text-center w-full ${
              [
                "Upgrade recommended",
                "Time for upgrade",
                "Fix recommended",
              ].some((s) => status.includes(s))
                ? "text-blue hover:bg-hoverBlue rounded-full"
                : "bg-green-500"
            }`}
            onClick={() =>
              handleSlackNotification(row.original, email, tenantName)
            }
          >
            {status}
          </button>
        </div>
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
  computerExpiration,
  handleSlackNotification,
}: ComputerUpgradeTableProps) => {
  const computersWithStatus = useMemo(() => {
    const realProducts = products
      .filter((product) => product.category === "Computer")
      .map((product) => {
        const acquisitionDate = product.acquisitionDate
          ? new Date(product.acquisitionDate)
          : null;
        const yearsSinceAcquisition = acquisitionDate
          ? (Date.now() - acquisitionDate.getTime()) /
            (1000 * 60 * 60 * 24 * 365)
          : null;

        const condition = product.productCondition?.toLowerCase() || "optimal";

        let baseStatus;
        if (condition === "defective") {
          if (
            yearsSinceAcquisition === null ||
            yearsSinceAcquisition < computerExpiration - 0.5
          ) {
            baseStatus = "Fix recommended";
          } else if (yearsSinceAcquisition < computerExpiration) {
            baseStatus = "Time for upgrade";
          } else {
            baseStatus = "Upgrade recommended";
          }
        } else if (condition === "unusable") {
          baseStatus = "Upgrade recommended";
        } else {
          baseStatus = getStatus(
            yearsSinceAcquisition || 0,
            computerExpiration
          );
        }

        const status =
          condition !== "optimal"
            ? `${
                condition.charAt(0).toUpperCase() + condition.slice(1)
              } - ${baseStatus}`
            : baseStatus;

        return {
          _id: product._id,
          brandModel: `${
            product.attributes?.find((attr) => attr.key === "brand")?.value ||
            ""
          } ${
            product.attributes?.find((attr) => attr.key === "model")?.value ||
            ""
          }`,
          serial: product.serialNumber || "N/A",
          yearsSinceAcquisition: yearsSinceAcquisition ?? Infinity,
          status,
          location:
            product.location === "Employee"
              ? product.assignedMember || "Unknown"
              : product.location,
          assignedMember: product.assignedMember,
          hasDate: !!acquisitionDate,
        };
      });

    const computersNeedingUpgrade = realProducts.filter((comp) => {
      return (
        comp.yearsSinceAcquisition >= computerExpiration - 0.5 ||
        comp.status.includes("Defective") ||
        comp.status.includes("Unusable")
      );
    });

    const uniqueComputers = computersNeedingUpgrade.reduce((acc, curr) => {
      if (!acc.some((comp) => comp._id === curr._id)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    return uniqueComputers.sort((a, b) => {
      if (a.hasDate && b.hasDate) {
        return b.yearsSinceAcquisition - a.yearsSinceAcquisition;
      }
      return a.hasDate ? -1 : 1;
    });
  }, [products, computerExpiration]);

  return (
    <BirthdayRoot
      columns={computerColumns(
        email,
        tenantName,
        computerExpiration,
        handleSlackNotification
      )}
      data={computersWithStatus}
    />
  );
};

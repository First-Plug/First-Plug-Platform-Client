const getStatusColor = (status: ShipmentStatus) => {
  switch (status) {
    case "On Hold - Missing Data":
      return "bg-[#FF8A80] text-black";
    case "Received":
      return "bg-lightGreen text-black";
    case "Cancelled":
      return "bg-[#FFC6D3] text-black";
    case "On The Way":
      return "bg-lightBlue text-black";
    case "In Preparation":
      return "bg-lightPurple text-black";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getShipmentTypeColor = (type: ShipmentType) => {
  switch (type) {
    case "Courrier":
      return "bg-rose-100 text-black border border-rose-200";
    case "Internal":
      return "bg-cyan-100 text-black border border-cyan-200";
    case "TBC":
      return "bg-violet-100 text-black border border-violet-200";
    default:
      return "bg-zinc-100 text-black border border-zinc-200";
  }
};

import { ColumnDef } from "@tanstack/react-table";
import {
  LogisticOrder,
  ShipmentStatus,
  ShipmentType,
} from "../interfaces/logistics";
import { Badge, Button, PenIcon } from "@/shared";
import { DetailsButton } from "@/shared/components/Tables";
import { useMemo } from "react";
import { useAsideStore } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";

export const useLogisticsTableColumns = ({
  data,
}: {
  data: LogisticOrder[];
}): ColumnDef<LogisticOrder>[] => {
  const { setAside } = useAsideStore();
  const queryClient = useQueryClient();
  const filterOptions = useMemo(() => {
    const tenants = Array.from(new Set(data.map((item) => item.tenant))).sort();
    const orderIds = Array.from(
      new Set(data.map((item) => item.orderId))
    ).sort();

    const dates = Array.from(new Set(data.map((item) => item.orderDate)))
      .filter((dateString) => dateString && dateString.trim() !== "")
      .map((dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
          return null;
        }
        return {
          original: dateString,
          parsed: date,
          formatted: date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => b!.parsed.getTime() - a!.parsed.getTime())
      .map((item) => ({
        label: item!.formatted,
        value: item!.original,
      }));

    const updatedDates = Array.from(new Set(data.map((item) => item.updatedAt)))
      .filter((dateString) => dateString && dateString.trim() !== "")
      .map((dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
          return null;
        }
        return {
          original: dateString,
          parsed: date,
          formatted: date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => b!.parsed.getTime() - a!.parsed.getTime())
      .map((item) => ({
        label: item!.formatted,
        value: item!.original,
      }));

    const quantities = Array.from(
      new Set(data.map((item) => item.quantity))
    ).sort((a, b) => a - b);
    const prices = Array.from(new Set(data.map((item) => item.price))).sort();
    const origins = Array.from(new Set(data.map((item) => item.origin))).sort();
    const destinations = Array.from(
      new Set(data.map((item) => item.destination))
    ).sort();
    const shipmentTypes = Array.from(
      new Set(data.map((item) => item.shipmentType))
    ).sort();
    const shipmentStatuses = Array.from(
      new Set(data.map((item) => item.shipmentStatus))
    ).sort();

    return {
      tenants: tenants.map((tenant) => ({ label: tenant, value: tenant })),
      orderIds: orderIds.map((id) => ({ label: id, value: id })),
      dates: dates,
      updatedDates: updatedDates,
      quantities: quantities.map((qty) => ({
        label: qty.toString(),
        value: qty.toString(),
      })),
      prices: prices.map((price) => ({ label: price, value: price })),
      origins: origins.map((origin) => ({ label: origin, value: origin })),
      destinations: destinations.map((dest) => ({ label: dest, value: dest })),
      shipmentTypes: shipmentTypes.map((type) => ({
        label: type,
        value: type,
      })),
      shipmentStatuses: shipmentStatuses.map((status) => ({
        label: status,
        value: status,
      })),
    };
  }, [data]);

  return [
    {
      accessorKey: "tenant",
      header: "Tenant",
      size: 100,
      meta: {
        hasFilter: true,
        filterOptions: filterOptions.tenants,
      },
      cell: ({ row }) => {
        const tenant = row.getValue("tenant") as string;
        return tenant;
      },
    },
    {
      accessorKey: "orderId",
      header: "Order ID",
      size: 90,
      meta: {
        hasFilter: true,
        filterOptions: filterOptions.orderIds,
      },
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.getValue("orderId")}
        </div>
      ),
    },
    {
      accessorKey: "orderDate",
      header: "Date",
      size: 85,
      meta: {
        hasFilter: true,
        filterOptions: filterOptions.dates,
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.orderDate);
        const dateB = new Date(rowB.original.orderDate);
        return dateA.getTime() - dateB.getTime();
      },
      cell: ({ row }) => {
        const dateString = row.getValue("orderDate") as string;
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        return <div className="text-gray-900">{formattedDate}</div>;
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      size: 90,
      meta: {
        hasFilter: true,
        filterOptions: filterOptions.quantities,
      },
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("quantity")}</div>
      ),
    },
    {
      accessorKey: "shipmentType",
      header: "Type",
      size: 85,
      meta: {
        hasFilter: true,
        filterOptions: filterOptions.shipmentTypes,
      },
      cell: ({ row }) => {
        const type = row.getValue("shipmentType") as ShipmentType;
        return <Badge className={getShipmentTypeColor(type)}>{type}</Badge>;
      },
    },
    {
      accessorKey: "shipmentStatus",
      header: "Status",
      size: 140,
      meta: {
        hasFilter: true,
        filterOptions: filterOptions.shipmentStatuses,
      },
      cell: ({ row }) => {
        const status = row.getValue("shipmentStatus") as ShipmentStatus;
        return <Badge className={getStatusColor(status)}>{status}</Badge>;
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      size: 110,
      meta: {
        hasFilter: true,
        filterOptions: filterOptions.prices,
      },
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.getValue("price")}</div>
      ),
    },

    {
      accessorKey: "updatedAt",
      header: "Updated",
      size: 90,
      meta: {
        hasFilter: true,
        filterOptions: filterOptions.updatedDates,
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.updatedAt);
        const dateB = new Date(rowB.original.updatedAt);
        return dateA.getTime() - dateB.getTime();
      },
      cell: ({ row }) => {
        const dateString = row.getValue("updatedAt") as string;
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return <div className="text-gray-900">{formattedDate}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 70,
      cell: ({ row }) => {
        const handleEdit = () => {
          queryClient.setQueryData(["selectedLogisticsShipment"], row.original);
          setAside("EditLogisticsShipment");
        };

        return (
          <div className="flex justify-center">
            <Button
              variant="text"
              onClick={handleEdit}
              className="hover:bg-transparent p-1"
            >
              <PenIcon
                className="w-4 h-4 text-blue hover:text-blue/70"
                strokeWidth={2}
              />
            </Button>

            {row.getCanExpand() ? <DetailsButton row={row} /> : null}
          </div>
        );
      },
    },
  ];
};

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

const getTenantColor = (tenant: string) => {
  switch (tenant) {
    case "Empresa A":
      return "bg-blue-100 text-blue-800";
    case "Empresa B":
      return "bg-green-100 text-green-800";
    case "Empresa C":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
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
    const dates = Array.from(
      new Set(data.map((item) => item.orderDate))
    ).sort();
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
      dates: dates.map((date) => ({ label: date, value: date })),
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
        return <Badge className={getTenantColor(tenant)}>{tenant}</Badge>;
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
      cell: ({ row }) => (
        <div className="text-gray-900">{row.getValue("orderDate")}</div>
      ),
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
      accessorKey: "orderDate",
      header: "Updated",
      size: 90,
      meta: {
        hasFilter: true,
        filterOptions: filterOptions.dates,
      },
      cell: ({ row }) => (
        <div className="text-gray-900">{row.getValue("orderDate")}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 70,
      cell: ({ row }) => {
        const handleEdit = () => {
          // Guardar el envío seleccionado en el caché
          queryClient.setQueryData(["selectedLogisticsShipment"], row.original);
          // Abrir la aside de edición
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

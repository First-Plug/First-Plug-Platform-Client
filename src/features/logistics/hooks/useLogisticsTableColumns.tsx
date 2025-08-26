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

import { useAsideStore } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";

export const useLogisticsTableColumns = ({
  data,
}: {
  data: LogisticOrder[];
}): ColumnDef<LogisticOrder>[] => {
  const { setAside } = useAsideStore();
  const queryClient = useQueryClient();

  return [
    {
      accessorKey: "tenant",
      header: "Tenant",
      size: 100,
      meta: {
        hasFilter: true,
        filterOptions: Array.from(new Set(data.map((item) => item.tenant))).map(
          (tenant) => ({
            label: tenant,
            value: tenant,
          })
        ),
      },
      cell: ({ row }) => {
        const tenant = row.getValue("tenant") as string;
        return tenant;
      },
    },
    {
      accessorKey: "order_id",
      header: "Order ID",
      size: 90,
      meta: {
        hasFilter: true,
        filterOptions: Array.from(
          new Set(data.map((item) => item.order_id))
        ).map((orderId) => ({
          label: orderId,
          value: orderId,
        })),
      },
      cell: ({ row }) => {
        return (
          <div className="font-medium text-gray-900">
            {row.getValue("order_id")}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      size: 85,
      meta: {
        hasFilter: true,
        filterOptions: Array.from(
          new Set(
            data.map((item) =>
              new Date(item.createdAt).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            )
          )
        ).map((dateString) => ({
          label: dateString,
          value: dateString,
        })),
      },
      cell: ({ row }) => {
        const dateString = row.original.createdAt;
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
      accessorKey: "quantity_products",
      header: "Quantity",
      size: 90,
      meta: {
        hasFilter: true,
        filterOptions: Array.from(
          new Set(data.map((item) => item.quantity_products))
        ).map((quantity) => ({
          label: quantity.toString(),
          value: quantity.toString(),
        })),
      },
      cell: ({ row }) => {
        const quantity = row.getValue("quantity_products") as number;
        return <div className="text-center">{quantity}</div>;
      },
    },
    {
      accessorKey: "shipment_type",
      header: "Type",
      size: 85,
      meta: {
        hasFilter: true,
        filterOptions: Array.from(
          new Set(data.map((item) => item.shipment_type))
        ).map((type) => ({
          label: type,
          value: type,
        })),
      },
      cell: ({ row }) => {
        const type = row.getValue("shipment_type") as ShipmentType;
        return <Badge className={getShipmentTypeColor(type)}>{type}</Badge>;
      },
    },
    {
      accessorKey: "shipment_status",
      header: "Status",
      size: 140,
      meta: {
        hasFilter: true,
        filterOptions: (() => {
          const statusOrder: ShipmentStatus[] = [
            "On Hold - Missing Data",
            "In Preparation",
            "On The Way",
            "Received",
            "Cancelled",
          ];

          const availableStatuses = Array.from(
            new Set(data.map((item) => item.shipment_status))
          );

          return statusOrder
            .filter((status) => availableStatuses.includes(status))
            .map((status) => ({
              label: status,
              value: status,
            }));
        })(),
      },
      cell: ({ row }) => {
        const status = row.getValue("shipment_status") as ShipmentStatus;
        return <Badge className={getStatusColor(status)}>{status}</Badge>;
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      size: 110,
      meta: {
        hasFilter: true,
        filterOptions: (() => {
          const priceOptions = new Set<string>();

          data.forEach((item) => {
            const price = item.price;
            if (price.amount === null || price.amount === undefined) {
              // Si no hay amount, solo mostrar currencyCode (ej: "TBC")
              priceOptions.add(price.currencyCode);
            } else {
              // Si hay amount, mostrar currencyCode + amount
              priceOptions.add(`${price.currencyCode} ${price.amount}`);
            }
          });

          return Array.from(priceOptions).map((priceString: string) => ({
            label: priceString,
            value: priceString,
          }));
        })(),
      },
      cell: ({ row }) => {
        const price = row.getValue("price") as {
          amount: number;
          currencyCode: string;
        };
        return (
          <div className="font-medium text-gray-900">
            {price.currencyCode} {price.amount}
          </div>
        );
      },
    },

    {
      accessorKey: "updatedAt",
      header: "Updated",
      size: 90,
      meta: {
        hasFilter: false,
      },
      cell: ({ row }) => {
        const dateString = row.original.updatedAt;
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

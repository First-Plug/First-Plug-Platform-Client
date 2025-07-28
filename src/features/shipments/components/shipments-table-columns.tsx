"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { type Shipment } from "../interfaces/shipments-response.interface";
import { ArrowRight, Button } from "@/shared";
import { DeleteAction } from "@/shared";
import { ExternalLinkIcon } from "lucide-react";
import { EditShipment } from "./edit-shipment";
import { useShipmentStore } from "../store/useShipmentStore";

const statusColors = {
  "In Preparation": "bg-lightPurple",
  "On The Way": "bg-lightBlue",
  Received: "bg-lightGreen",
  Cancelled: "bg-[#FFC6D3]",
  "On Hold - Missing Data": "bg-[#FF8A80]",
};

interface UseShipmentsTableColumnsProps {
  shipments: Shipment[];
}

export const useShipmentsTableColumns = ({
  shipments,
}: UseShipmentsTableColumnsProps) => {
  const expandedShipmentId = useShipmentStore((s: any) => s.expandedShipmentId);
  const setExpandedShipmentId = useShipmentStore(
    (s: any) => s.setExpandedShipmentId
  );

  const columns = useMemo<ColumnDef<Shipment>[]>(
    () => [
      {
        accessorKey: "order_id",
        id: "order_id",
        header: "Order ID",
        size: 120,
        maxSize: 120,
        meta: {
          hasFilter: true,
          filterOptions: (() => {
            const orderIdToDateMap = new Map<string, Date>();
            shipments?.forEach((s) => {
              if (!orderIdToDateMap.has(s.order_id)) {
                orderIdToDateMap.set(s.order_id, new Date(s.order_date));
              }
            });

            return Array.from(new Set(shipments?.map((s) => s.order_id)))
              .map((orderId) => ({
                label: orderId,
                value: orderId,
                date: orderIdToDateMap.get(orderId) || new Date(0),
              }))
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map(({ label, value }) => ({ label, value }));
          })(),
        },
      },
      {
        accessorKey: "order_date",
        id: "order_date",
        header: "Order Date",
        size: 120,
        maxSize: 120,
        cell: (info) => {
          const date = new Date(info.getValue() as string | number | Date);
          return date.toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        },
        meta: {
          hasFilter: true,
          filterOptions: (() => {
            const formattedDateToRealDateMap = new Map<string, Date>();
            shipments?.forEach((s) => {
              const formattedDate = new Date(s.order_date).toLocaleDateString(
                "es-AR",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }
              );
              if (!formattedDateToRealDateMap.has(formattedDate)) {
                formattedDateToRealDateMap.set(
                  formattedDate,
                  new Date(s.order_date)
                );
              }
            });

            return Array.from(
              new Set(
                shipments?.map((s) =>
                  new Date(s.order_date).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                )
              )
            )
              .map((date) => ({
                label: date,
                value: date,
                realDate: formattedDateToRealDateMap.get(date) || new Date(0),
              }))
              .sort((a, b) => b.realDate.getTime() - a.realDate.getTime())
              .map(({ label, value }) => ({ label, value }));
          })(),
        },
      },
      {
        accessorKey: "quantity_products",
        id: "quantity_products",
        header: "Quantity Products",
        size: 140,
        maxSize: 140,
        meta: {
          hasFilter: true,
          filterOptions: Array.from(
            new Set(shipments?.map((s) => s.quantity_products.toString()))
          )
            .map((quantity) => ({ label: quantity, value: quantity }))
            .sort((a, b) => parseInt(a.label) - parseInt(b.label)),
        },
      },
      {
        accessorKey: "shipment_type",
        id: "shipment_type",
        header: "Type",
        size: 80,
        maxSize: 80,
        meta: {
          hasFilter: true,
          filterOptions: Array.from(
            new Set(shipments?.map((s) => s.shipment_type))
          )
            .map((type) => ({ label: type, value: type }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        },
      },
      {
        accessorKey: "shipment_status",
        id: "shipment_status",
        header: "Status",
        size: 160,
        maxSize: 160,
        cell: ({ row }) => {
          const status = row.original.shipment_status;
          const isClickable = Boolean(
            row.original.shipment_type === "Courrier" &&
              (status === "On The Way" || status === "Received") &&
              row.original.trackingURL
          );

          return (
            <div
              className={`inline-flex items-center ${
                statusColors[status]
              } text-black px-2 py-1 rounded-md ${
                isClickable ? "cursor-pointer hover:bg-opacity-80" : ""
              }`}
              onClick={() => {
                if (isClickable) {
                  window.open(row.original.trackingURL, "_blank");
                }
              }}
            >
              <span>{status}</span>
              {isClickable && <ExternalLinkIcon className="ml-1 w-3 h-3" />}
            </div>
          );
        },
        meta: {
          hasFilter: true,
          filterOptions: Array.from(
            new Set(shipments?.map((s) => s.shipment_status))
          )
            .map((status) => ({ label: status, value: status }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        },
      },
      {
        accessorKey: "price",
        id: "price",
        header: "Price",
        size: 80,
        maxSize: 80,
        cell: ({ row }) => {
          const { amount, currencyCode } = row.original.price;

          if (amount === null) return <span>-</span>;
          if (amount === 0) return <span>FREE</span>;
          return <span>{`${amount} ${currencyCode}`}</span>;
        },
        meta: {
          hasFilter: true,
          filterOptions: Array.from(
            new Set(
              shipments?.map((s) => {
                const { amount, currencyCode } = s.price;
                if (amount === null) return "No Data";
                if (amount === 0) return "FREE";
                return `${amount} ${currencyCode}`;
              })
            )
          )
            .map((price) => ({ label: price, value: price }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        },
      },
      {
        accessorKey: "",
        id: "actions",
        header: "Actions",
        size: 60,
        maxSize: 60,
        cell: ({ row }) => {
          const isDisabled =
            row.original.shipment_status !== "In Preparation" &&
            row.original.shipment_status !== "On Hold - Missing Data";

          return (
            <div className="flex gap-1">
              <EditShipment shipment={row.original} isDisabled={isDisabled} />
              <DeleteAction
                type="shipment"
                id={row.original._id}
                disabled={isDisabled}
              />
            </div>
          );
        },
      },
      {
        id: "expander",
        header: () => null,
        size: 100,
        maxSize: 100,
        cell: ({ row }) => {
          const rowId = row.original._id;
          const isExpanded = expandedShipmentId === rowId;

          return (
            <Button
              variant="text"
              className="relative"
              onClick={() => {
                setExpandedShipmentId(
                  expandedShipmentId === rowId ? null : rowId
                );
              }}
            >
              <span>Details</span>
              <ArrowRight
                className={`transition-all duration-200 transform ${
                  isExpanded ? "rotate-90" : "rotate-0"
                }`}
              />
            </Button>
          );
        },
      },
    ],
    [shipments, expandedShipmentId, setExpandedShipmentId]
  );

  return columns;
};

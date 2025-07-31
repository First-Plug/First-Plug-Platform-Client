"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button, ArrowRight } from "@/shared";

export function useActivityTableColumns() {
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "_id",
        header: "Id Action",
        size: 180,
      },
      {
        accessorKey: "itemType",
        header: "Item Type",
        size: 80,
      },
      {
        accessorKey: "actionType",
        header: "Action",
        size: 100,
      },
      {
        header: "Quantity",
        size: 80,
        cell: ({ row }) => {
          const { actionType, itemType } = row.original;
          if (actionType === "offboarding" && itemType === "members") {
            return row.original.changes.oldData.products.length;
          }

          return (
            row.original.changes?.newData?.length ||
            row.original.changes?.oldData?.length ||
            1
          );
        },
      },
      {
        accessorKey: "userId",
        header: "User",
        size: 200,
      },
      {
        accessorKey: "createdAt",
        header: "Date and time",
        size: 140,
        cell: (info) => {
          const date = new Date(info.getValue() as string);
          return date.toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        },
      },
      {
        id: "expander",
        header: () => null,
        size: 100,
        cell: ({ row }) => {
          return (
            <Button
              variant="text"
              className="relative"
              onClick={() => row.toggleExpanded()}
            >
              <span>Details</span>
              <ArrowRight
                className={`transition-all duration-200 transform ${
                  row.getIsExpanded() ? "rotate-90" : "rotate-0"
                }`}
              />
            </Button>
          );
        },
      },
    ],
    []
  );

  return columns;
}

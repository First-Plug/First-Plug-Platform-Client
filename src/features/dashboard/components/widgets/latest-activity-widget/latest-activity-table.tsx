"use client";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { Button } from "@/shared";
import { DataTable } from "@/features/fp-tables";
import { createFilterStore } from "@/features/fp-tables/store/createFilterStore";
import { endOfDay, startOfDay, subDays } from "date-fns";

interface LatestActivityTableProps {
  history: any[];
}

export const LatestActivityTable = ({ history }: LatestActivityTableProps) => {
  const router = useRouter();
  const useFilterStore = createFilterStore();

  const activityColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "createdAt",
        accessorKey: "createdAt",
        size: 120,
        header: "Date and time",
        cell: ({ getValue }) => {
          const date = new Date(getValue<string>());
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
        id: "userId",
        accessorKey: "userId",
        size: 200,
        header: "User",
      },
      {
        id: "itemType",
        accessorKey: "itemType",
        size: 80,
        header: "Item Type",
      },
      {
        id: "actionType",
        accessorKey: "actionType",
        size: 70,
        header: "Action",
      },
      {
        id: "details",
        size: 80,
        header: "",
        cell: ({ row }) => {
          const startDate = startOfDay(subDays(new Date(), 7));
          const endDate = endOfDay(new Date());
          const createdAt = new Date(row.original.createdAt);

          if (createdAt >= startDate && createdAt <= endDate) {
            return (
              <Button
                variant="text"
                className="relative px-2 py-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/home/activity?activityId=${row.original._id}`);
                }}
              >
                <span>Details</span>
              </Button>
            );
          }

          return null;
        },
      },
    ],
    [router]
  );

  const handleViewMore = () => {
    router.push(`/home/activity`);
  };

  return (
    <div className="flex flex-col mt-2 w-full h-full">
      <DataTable
        columns={activityColumns}
        data={history}
        useFilterStore={useFilterStore}
        tableId="latest-activity-table"
        adaptiveHeight={true}
        enableSnapScroll={false}
        rowHeight={40}
        viewMoreRow={{
          text: "View More",
          onClick: handleViewMore,
        }}
      />
    </div>
  );
};

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button, EmptyDashboardCard, Card } from "@/shared";

import { endOfDay, startOfDay, subDays } from "date-fns";

interface Props {
  history: any[];
}

export const LatestActivityWidget = ({ history }: Props) => {
  const router = useRouter();

  const columns = useMemo(
    () => [
      {
        accessorKey: "createdAt",
        header: "Date and time",
        cell: (info) => {
          const date = new Date(info.getValue());
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
      { accessorKey: "userId", header: "User" },
      { accessorKey: "itemType", header: "Item Type" },
      { accessorKey: "actionType", header: "Action" },
      {
        id: "details",
        header: "",
        cell: ({ row }) => {
          const startDate = startOfDay(subDays(new Date(), 7));
          const endDate = endOfDay(new Date());
          const createdAt = new Date(row.original.createdAt);

          if (createdAt >= startDate && createdAt <= endDate) {
            return (
              <Button
                variant="text"
                className="relative"
                onClick={() => {
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
    []
  );

  const table = useReactTable({
    data: history,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (history.length === 0) {
    return <EmptyDashboardCard type="latestActivity" handleSwapy />;
  }

  return (
    <Card className="bg-white h-full" Title="Latest Activity" handleSwapy>
      <div className="mx-auto border rounded-md w-full h-full overflow-y-auto scrollbar-custom">
        <Table className="m-0 w-full border-collapse">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-light-grey border-gray-200 rounded-md"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-3 border-r font-semibold text-black text-start"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-gray-200 border-b text-black text-md text-left"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-xs">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
            <TableRow
              className="hover:bg-hoverBlue border-gray-200 border-b text-black text-md text-left cursor-pointer"
              onClick={() => router.push(`/home/activity`)}
            >
              <TableCell
                colSpan={columns.length}
                className="py-4 font-semibold text-center"
              >
                View More
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

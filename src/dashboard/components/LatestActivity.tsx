import { Card } from "@/components";
import { Datum } from "@/action-history/interfaces";
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
import { Button } from "@/common";
import { useRouter } from "next/navigation";

interface Props {
  history: Datum[];
}

export const LatestActivity = ({ history }: Props) => {
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
        cell: ({ row }) => (
          <Button
            variant="text"
            className="relative"
            onClick={() => {
              router.push(`/home/activity?activityId=${row.original._id}`);
            }}
          >
            <span>Details</span>
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: history,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="h-full bg-white" Title="Latest Activity" handleSwapy>
      <div className="h-full overflow-y-auto scrollbar-custom rounded-md border w-full mx-auto">
        <Table className="w-full border-collapse m-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-gray-200 bg-light-grey rounded-md"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="py-3 px-4 border-r text-start text-black font-semibold"
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
                  className="text-black border-b text-md border-gray-200 text-left"
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
              className="text-black border-b text-md border-gray-200 text-left cursor-pointer hover:bg-hoverBlue"
              onClick={() => router.push(`/home/activity`)}
            >
              <TableCell
                colSpan={columns.length}
                className="text-center py-4 font-semibold"
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

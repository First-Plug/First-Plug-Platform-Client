import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";

import type { Shipment } from "@/features/shipments";
import { ProductImage } from "@/common";
import PrdouctModelDetail from "@/common/PrdouctModelDetail";

interface Props {
  data: Shipment;
}

export const ShipmentDetailsTable = ({ data }: Props) => {
  const tableData = useMemo(() => {
    return data.snapshots ?? [];
  }, [data.snapshots]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 w-[150px] text-lg">
            <ProductImage category={getValue<string>()} />
            <p>{getValue<string>()}</p>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 50,
        cell: ({ row }) => {
          return <PrdouctModelDetail product={row.original} />;
        },
      },
      {
        accessorKey: "serialNumber",
        header: "Serial",
        size: 200,
        cell: ({ getValue }) => (
          <span className="font-semibold">#{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "origin",
        header: "Origin / Pickup Date",
        cell: () => {
          return (
            <div className="flex flex-col">
              <span className="font-medium">{data.origin ?? "—"}</span>
              <span className="text-gray-700">
                Pickup Date:{" "}
                {data.originDetails?.desirableDate
                  ? formatDate(data.originDetails.desirableDate)
                  : "—"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "destination",
        header: "Destination / Delivery Date",
        cell: () => {
          return (
            <div className="flex flex-col">
              <span className="font-medium">{data.destination}</span>
              <span className="text-gray-700">
                Delivery Date:{" "}
                {data.destinationDetails?.desirableDate
                  ? formatDate(data.destinationDetails.desirableDate)
                  : "—"}
              </span>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
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
                style={{
                  width: header.getSize(),
                }}
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
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="px-4 py-4 border-r text-xs">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(parsedDate);
}

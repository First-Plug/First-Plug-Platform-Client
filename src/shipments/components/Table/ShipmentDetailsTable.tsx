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

import type { Shipment } from "@/shipments/interfaces/shipments-response.interface";
import { ProductImage } from "@/common";
import PrdouctModelDetail from "@/common/PrdouctModelDetail";

interface Props {
  data: Shipment;
}

const ShipmentDetailsTable = ({ data }: Props) => {
  const tableData = useMemo(() => {
    return data.snapshots ?? [];
  }, [data.snapshots]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => (
          <div className="flex gap-2 text-lg items-center w-[150px]">
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
            className="border-gray-200 bg-light-grey rounded-md"
          >
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className="py-3 px-4 border-r text-start text-black font-semibold"
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
              <TableCell key={cell.id} className="text-xs py-4 px-4 border-r">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ShipmentDetailsTable;

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

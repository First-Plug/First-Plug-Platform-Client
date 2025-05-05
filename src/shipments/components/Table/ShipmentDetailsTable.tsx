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

import type { Shipments } from "@/shipments/interfaces/shipments-response.interface";

interface Props {
  data: Shipments;
}

// TODO: Seguir cuando me pueda traer datos
const ShipmentDetailsTable = ({ data }: Props) => {
  const assets = data.snapshots ?? [];

  const tableData = useMemo(() => {
    return assets.map((asset) => ({
      category: asset.category,
      name: asset.name,
      serial: asset.serialNumber,
      origin: "",
      destination: "",
    }));
  }, [assets]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "category",
        header: "Category",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "serial",
        header: "Serial",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "origin",
        header: "Origin / Pickup Date",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "destination",
        header: "Destination / Delivery Date",
        cell: (info) => info.getValue(),
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
        {table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No assets found.
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-xs py-2 px-4 border-r">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ShipmentDetailsTable;

// Utilidad opcional para formatear fechas
function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  CountryFlag,
} from "@/shared";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";

import type { Shipment } from "@/features/shipments";
import { ProductImage, PrdouctModelDetail } from "@/features/assets";
import { countriesByCode } from "@/shared/constants/country-codes";

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
          const originCountry =
            data.originDetails?.country ||
            (data.origin === "FP warehouse"
              ? data.destinationDetails?.country
              : undefined);
          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {originCountry && (
                  <div className="group relative">
                    <CountryFlag
                      countryName={originCountry}
                      size={16}
                      className="rounded-sm"
                    />
                    <span className="hidden group-hover:block bottom-full left-1/2 z-50 absolute bg-blue/80 mb-2 px-2 py-1 rounded text-white text-xs whitespace-nowrap -translate-x-1/2 transform">
                      {countriesByCode[originCountry] || originCountry}
                    </span>
                  </div>
                )}
                <span className="font-medium">{data.origin ?? "—"}</span>
              </div>
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
          const destinationCountry =
            data.destinationDetails?.country ||
            (data.destination === "FP warehouse"
              ? data.originDetails?.country
              : undefined);
          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {destinationCountry && (
                  <div className="group relative">
                    <CountryFlag
                      countryName={destinationCountry}
                      size={16}
                      className="rounded-sm"
                    />
                    <span className="hidden group-hover:block bottom-full left-1/2 z-50 absolute bg-blue/80 mb-2 px-2 py-1 rounded text-white text-xs whitespace-nowrap -translate-x-1/2 transform">
                      {countriesByCode[destinationCountry] ||
                        destinationCountry}
                    </span>
                  </div>
                )}
                <span className="font-medium">{data.destination}</span>
              </div>
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
    [data]
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
  const clean = date.split("T")[0];

  const [year, month, day] = clean.split("-");

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

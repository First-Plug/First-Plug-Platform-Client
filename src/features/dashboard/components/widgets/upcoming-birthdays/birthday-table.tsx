"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Member } from "@/features/members";
import { TeamCard, MiniCake } from "@/shared";

import { formatBirthDate, isBirthdayToday } from "@/features/dashboard";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared";

const birthdayColumns: ColumnDef<Member>[] = [
  {
    id: "fullName",
    accessorKey: "fullName",
    size: 300,
    header: "Full Name",
    cell: ({ getValue }) => (
      <span className="font-semibold text-blue-500">{getValue<string>()}</span>
    ),
  },
  {
    id: "birthDate",
    accessorKey: "birthDate",
    size: 100,
    header: "Date of Birth",
    cell: ({ row, getValue }) => {
      const isToday = isBirthdayToday(row.original.birthDate);
      return (
        <span className="flex justify-between items-center gap-1 font-semibold text-blue-500">
          {formatBirthDate(getValue<string>())}
          {isToday && <MiniCake />}
        </span>
      );
    },
  },
  {
    id: "team",
    accessorKey: "team",
    size: 100,
    header: "Team",
    cell: ({ cell }) => {
      const team = cell.row.original.team || null;
      return (
        <section className="flex justify-start">
          <TeamCard team={team} />
        </section>
      );
    },
  },
];

interface BirthdayTableProps {
  members: Member[];
}

export const BirthdayTable = ({ members }: BirthdayTableProps) => {
  const table = useReactTable({
    data: members,
    columns: birthdayColumns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
  });

  return (
    <div className="w-full overflow-y-auto scrollbar-custom">
      <Table className="bg-white border border-gray-300 w-full table-auto">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-light-grey border-gray-200 rounded-md"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="px-4 border-r font-semibold text-black text-start"
                >
                  <div className="flex justify-between items-center w-full">
                    <div>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={`text-black border-b text-md border-gray-200 text-left ${
                  row.getIsExpanded() &&
                  "border-l-2 border-l-black bg-hoverBlue"
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-xs">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={birthdayColumns.length}
                className="h-24 text-center"
              >
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

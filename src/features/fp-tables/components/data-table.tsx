"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  RowData,
  Row,
} from "@tanstack/react-table";

import { createFilterStore, ColumnFilterPopover } from "@/features/fp-tables";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  useFilterStore: ReturnType<typeof createFilterStore>;
  rowHeight?: number;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
  getRowCanExpand?: (row: Row<TData>) => boolean;
  renderSubComponent?: (row: Row<TData>) => React.ReactNode;
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    hasFilter?: boolean;
    filterOptions?: { label: string; value: string }[];
    fetchFilterOptions?: () => Promise<{ label: string; value: string }[]>;
  }
}

export function DataTable<TData>({
  columns,
  data,
  useFilterStore,
  rowHeight = 70,
  scrollContainerRef,
  getRowCanExpand,
  renderSubComponent,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand,
  });

  const filters = useFilterStore((s) => s.filters);
  const setFilter = useFilterStore((s) => s.setFilter);

  return (
    <div className="relative flex flex-col flex-grow h-full">
      {/* <div className="mb-4">
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div> */}

      <div className="mx-auto border border-gray-200 rounded-md w-full overflow-hidden">
        <table className="w-full text-xs border-collapse table-fixed">
          <thead className="top-0 z-9 sticky bg-[#F7F7F9] border-gray-200 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="relative bg-[#F7F7F9]">
                {headerGroup.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className="relative bg-[#F7F7F9] py-1 pl-2 font-medium text-left"
                    style={{
                      width:
                        header.getSize() !== 150
                          ? `${header.getSize()}px`
                          : "auto",
                    }}
                  >
                    {index < headerGroup.headers.length - 1 && (
                      <span className="top-0 right-0 absolute bg-[#D9DBDE] w-[1px] h-full" />
                    )}
                    <div className="flex justify-between items-center w-full">
                      <span className="ml-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </span>
                      {header.column.columnDef.meta?.hasFilter && (
                        <ColumnFilterPopover
                          showSelectAll={true}
                          options={header.column.columnDef.meta?.filterOptions}
                          fetchOptions={
                            header.column.columnDef.meta?.fetchFilterOptions
                          }
                          value={filters[header.column.id] || []}
                          onChange={(values) =>
                            setFilter(header.column.id, values)
                          }
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        </table>
        <div
          ref={scrollContainerRef}
          className="min-h-[60vh] max-h-[60vh] overflow-y-auto snap-mandatory snap-y"
        >
          {table.getRowModel().rows.length === 0 ? (
            <div className="flex justify-center items-center h-full min-h-[60vh]">
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <svg
                  className="w-12 h-12 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="font-medium text-lg">No results found</span>
                <span className="text-sm">
                  No results found with the applied filters
                </span>
              </div>
            </div>
          ) : (
            <table className="w-full text-xs table-fixed">
              <tbody>
                {table.getRowModel().rows.map((row, index) => (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`z-10 border-gray-200 border-b ${
                        index !== 0 ? "border-t" : ""
                      } snap-start ${row.getIsExpanded() ? "bg-blue/10" : ""}`}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => (
                        <td
                          key={cell.id}
                          className={`px-4 ${
                            cellIndex === 0 && row.getIsExpanded()
                              ? "border-l-2 border-black"
                              : ""
                          }`}
                          style={{
                            paddingTop: `${rowHeight / 2 - 8}px`,
                            paddingBottom: `${rowHeight / 2 - 8}px`,
                            width:
                              cell.column.getSize() !== 150
                                ? `${cell.column.getSize()}px`
                                : "auto",
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                    {/* Renderizar contenido expandido */}
                    {row.getIsExpanded() && renderSubComponent && (
                      <tr>
                        <td
                          colSpan={row.getVisibleCells().length}
                          className="p-0 border-black border-l-2"
                        >
                          {renderSubComponent(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

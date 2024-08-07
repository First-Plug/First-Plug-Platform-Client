import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  useReactTable,
  RowData,
  PaginationState,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select";
    filterPositon?: "inline" | "bottom";
  }
}
import { Fragment, ReactNode, useState } from "react";
import { TableType } from "@/types";
import { TableActions } from "./TableActions";
import HeaderFilter from "./Filters/HeaderFilter";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "@/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectTrigger,
} from "../ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getRowCanExpand?: () => boolean;
  renderSubComponent?: (row: TData) => ReactNode;
  tableType: TableType;
  pageSize?: number;
  tableNameRef?: string;
}

export function RootTable<TData, TValue>({
  columns,
  data,
  getRowCanExpand,
  renderSubComponent,
  tableType,
  pageSize = 5,
  tableNameRef,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize:
      tableType === "subRow"
        ? 1000
        : parseInt(localStorage.getItem(tableNameRef)) || pageSize,
  });
  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      size: 200,
      minSize: 50,
      maxSize: 500,
    },
    state: {
      pagination,
      sorting,
      columnFilters,
    },
    autoResetPageIndex: true,
    debugTable: true,
    columnResizeMode: "onChange",
    onPaginationChange: setPagination,
    getRowCanExpand,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="h-full flex-grow  flex flex-col  gap-1 relative   ">
      {tableType !== "subRow" && (
        <div className="   max-h-[50%]  flex items-center   ">
          <TableActions table={table} type={tableType} />
        </div>
      )}
      <div
        className={`rounded-md border     w-full  mx-auto ${
          tableType === "members" ? "max-h-[80%]" : "max-h-[85%]"
        }  overflow-y-auto scrollbar-custom `}
      >
        <Table className="table ">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className=" border-gray-200 bg-light-grey rounded-md  "
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className={` py-3 px-4 border-r       text-start  text-black font-semibold   `}
                  >
                    <div className="flex w-full justify-between items-center">
                      <div>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </div>

                      <div
                        className={`${
                          header.column.getCanFilter() ? "" : "hidden"
                        }`}
                      >
                        {header.column.getCanFilter() ? (
                          <HeaderFilter
                            column={header.column}
                            tableType={tableType}
                            table={table}
                          />
                        ) : null}
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    key={row.id}
                    className={` text-black border-b text-md   border-gray-200 text-left  ${
                      row.getIsExpanded() &&
                      "border-l-2 border-l-black bg-hoverBlue"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-xs  ">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <tr className="border-l-2 border-l-black">
                      <td colSpan={row.getVisibleCells().length}>
                        {renderSubComponent && renderSubComponent(row.original)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                  style={{ width: "5px" }}
                >
                  -
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {tableType !== "subRow" && (
        <section className=" flex justify-center absolute w-full bottom-0 z-30 ">
          <div className=" flex items-center gap-10">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ArrowLeft className="w-5" />
            </Button>
            <span className="flex items-center gap-4">
              {new Array(parseInt(table.getPageCount().toLocaleString()))
                .fill("1")
                .map((pos, i) => (
                  <Button
                    key={i}
                    onClick={() =>
                      table.setPagination({
                        pageIndex: i,
                        pageSize: table.getState().pagination.pageSize,
                      })
                    }
                    className={`border rounded-full grid place-items-center transition-all duration-300 ${
                      table.getState().pagination.pageIndex === i
                        ? "bg-blue/80 text-white"
                        : ""
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}
            </span>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ArrowRight className="w-5" />
            </Button>
          </div>
          <div className=" absolute right-0">
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                if (tableNameRef) {
                  localStorage.setItem(tableNameRef, value);
                }
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger>
                <span className="">
                  Table size: {table.getState().pagination.pageSize}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  {[5, 10, 20].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      Show {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </section>
      )}
    </div>
  );
}

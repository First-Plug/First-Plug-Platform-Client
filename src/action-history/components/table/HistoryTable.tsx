import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HistorialServices } from "@/action-history/services";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { BarLoader } from "@/components/Loader/BarLoader";
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";

const fetchData = async (pageIndex: number, pageSize: number) => {
  try {
    return await HistorialServices.getAll(pageIndex, pageSize);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const HistoryTable = () => {
  const searchParams = useSearchParams();

  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const currentPage = parseInt((searchParams.get("page") as string) || "1");
  const activityPerPage = parseInt(
    (searchParams.get("pageSize") as string) || "10"
  );

  const [pagination, setPagination] = useState({
    pageIndex: activityPerPage >= 0 ? activityPerPage : 0,
    pageSize: 15,
  });

  useEffect(() => {
    setIsLoading(true);
    fetchData(currentPage, activityPerPage).then((result) => {
      setData(result.data);
      setTotalCount(result.totalCount);
      setIsLoading(false);
    });
  }, [currentPage, activityPerPage]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "Id Action",
      },
      {
        accessorKey: "itemType",
        header: "Item Type",
      },
      {
        accessorKey: "actionType",
        header: "Action",
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: (info) => {
          const {
            changes: { oldData, newData },
          } = info.row.original;

          const quantity =
            oldData !== null && oldData !== undefined
              ? Array.isArray(oldData)
                ? oldData.length
                : 1
              : newData !== null && newData !== undefined
              ? Array.isArray(newData)
                ? newData.length
                : 1
              : 1;

          return <span>{quantity}</span>;
        },
      },
      {
        accessorKey: "userId",
        header: "User",
      },
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
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalCount,
  });

  return (
    <>
      {isLoading && <BarLoader />}
      <div className="relative h-full flex-grow flex flex-col gap-1">
        <div className="max-h-[85%] overflow-y-auto scrollbar-custom rounded-md border w-full mx-auto">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-gray-200 bg-light-grey rounded-md"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
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
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No records in the history yet.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="text-black border-b text-md border-gray-200 text-left"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-xs ">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && (
          <div className="flex justify-center absolute w-full bottom-0 z-30">
            <PaginationWithLinks
              page={currentPage}
              pageSize={activityPerPage}
              totalCount={totalCount}
              pageSizeSelectOptions={{
                pageSizeOptions: [10, 25, 50],
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryTable;

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
import { ArrowLeft, ArrowRight } from "@/common";
import { Button } from "@/components/ui/button";
import { BarLoader } from "@/components/Loader/BarLoader";

const HistoryTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const pageIndexFromUrl = parseInt(searchParams.get("page") || "1", 15) - 1;

  const [pagination, setPagination] = useState({
    pageIndex: pageIndexFromUrl >= 0 ? pageIndexFromUrl : 0,
    pageSize: 15,
  });

  const fetchData = async () => {
    setIsLoading(true);

    const { pageIndex, pageSize } = pagination;
    try {
      const result = await HistorialServices.getAll(pageIndex + 1, pageSize);

      if (result.totalPages === 0) {
        setData([]);
        setPageCount(0);
      } else if (result.data.length === 0 && pageIndex >= result.totalPages) {
        const lastValidPage = Math.max(result.totalPages - 1, 0);
        router.push(`?page=${lastValidPage + 1}`);
        setPagination((prev) => ({
          ...prev,
          pageIndex: lastValidPage,
        }));
      } else {
        setData(result.data);
        setPageCount(result.totalPages);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination]);

  useEffect(() => {
    const page = searchParams.get("page");
    if (page) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: parseInt(page, 10) - 1,
      }));
    }
  }, [searchParams]);

  const handlePageChange = (pageIndex) => {
    router.push(`?page=${pageIndex + 1}`);
    setPagination((prev) => ({
      ...prev,
      pageIndex,
    }));
  };

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
    pageCount,
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
            <div className="flex items-center gap-10">
              <Button
                onClick={() =>
                  handlePageChange(table.getState().pagination.pageIndex - 1)
                }
                disabled={!table.getCanPreviousPage()}
              >
                <ArrowLeft className="w-5" />
              </Button>
              <span className="flex items-center gap-4">
                {new Array(pageCount).fill("1").map((_, i) => (
                  <Button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`border rounded-full grid place-items-center transition-all duration-300 ${
                      table.getState().pagination.pageIndex === i
                        ? "bg-blue/80 text-white disabled:bg-blue disabled:text-white"
                        : ""
                    }`}
                    disabled={table.getState().pagination.pageIndex === i}
                  >
                    {i + 1}
                  </Button>
                ))}
              </span>
              <Button
                onClick={() =>
                  handlePageChange(table.getState().pagination.pageIndex + 1)
                }
                disabled={!table.getCanNextPage()}
              >
                <ArrowRight className="w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryTable;

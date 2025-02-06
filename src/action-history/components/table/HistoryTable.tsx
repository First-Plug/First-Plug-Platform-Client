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
import DateRangeDropdown from "../date-range-calendar/DateRangeCalendar";
import { endOfDay, startOfDay, subDays } from "date-fns";

const DEFAULT_PAGE_SIZE = 10;
const VALID_PAGE_SIZES = [10, 25, 50];

const fetchData = async (pageIndex: number, pageSize: number) => {
  try {
    return await HistorialServices.getAll(pageIndex, pageSize);
  } catch (error) {
    console.error("Error fetching data:", error);
    return { data: [], totalCount: 0 };
  }
};

const HistoryTable = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const rawPageSize = parseInt(
    searchParams.get("pageSize") || `${DEFAULT_PAGE_SIZE}`,
    10
  );

  let pageSize = VALID_PAGE_SIZES.includes(rawPageSize)
    ? rawPageSize
    : DEFAULT_PAGE_SIZE;
  let currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let needsUpdate = false;

    if (!VALID_PAGE_SIZES.includes(rawPageSize)) {
      params.set("pageSize", DEFAULT_PAGE_SIZE.toString());
      needsUpdate = true;
    }

    if (isNaN(rawPage) || rawPage < 1) {
      params.set("page", "1");
      needsUpdate = true;
    }

    if (needsUpdate) {
      router.replace(`?${params.toString()}`);
    }
  }, [rawPage, rawPageSize, router]);

  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData(currentPage, pageSize).then((result) => {
      setData(result.data);
      setTotalCount(result.totalCount);
      setIsLoading(false);

      const maxPage = Math.ceil(result.totalCount / pageSize);
      if (currentPage > maxPage && maxPage > 0) {
        router.replace(`?page=1&pageSize=${pageSize}`);
      }
    });
  }, [currentPage, pageSize]);

  const columns = useMemo(
    () => [
      { accessorKey: "_id", header: "Id Action" },
      { accessorKey: "itemType", header: "Item Type" },
      { accessorKey: "actionType", header: "Action" },
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
      { accessorKey: "userId", header: "User" },
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
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalCount,
  });

  const [selectedDates, setSelectedDates] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: startOfDay(subDays(new Date(), 7)),
    endDate: endOfDay(new Date()),
  });

  const handleDateSelection = (dates: { startDate: Date; endDate: Date }) => {
    setSelectedDates(dates);
  };

  console.log(selectedDates);

  return (
    <>
      {isLoading && <BarLoader />}
      <div className="relative h-full flex-grow flex flex-col gap-1">
        <div className="flex justify-end">
          <DateRangeDropdown onDateSelect={handleDateSelection} />
        </div>
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
              pageSize={pageSize}
              totalCount={totalCount}
              pageSizeSelectOptions={{ pageSizeOptions: VALID_PAGE_SIZES }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryTable;

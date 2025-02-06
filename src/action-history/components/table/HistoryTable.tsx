import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HistorialServices } from "@/action-history/services";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnFiltersState,
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
import { Button } from "@/components/ui/button";
import { DropDownArrow } from "@/common";
import { flip, offset, shift, size, useFloating } from "@floating-ui/react-dom";
import FilterComponent from "@/components/Tables/Filters/FilterComponent";

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

interface Props {
  onClearFilters?: () => void;
}

const HistoryTable = ({ onClearFilters }: Props) => {
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

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState<{
    [key: string]: string[];
  }>({});
  const filterIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [clearAll, setClearAll] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState<string | null>(null);
  const filterRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
  const handleFilterChange = (columnId: string, selectedOptions: string[]) => {
    setSelectedFilterOptions((prev) => ({
      ...prev,
      [columnId]: selectedOptions,
    }));

    setColumnFilters((prev) => [
      ...prev.filter((f) => f.id !== columnId),
      {
        id: columnId,
        value: selectedOptions,
      },
    ]);
  };

  const { x, y, strategy, refs, update, middlewareData } = useFloating({
    strategy: "fixed",
    middleware: [
      offset({
        mainAxis: 8,
        crossAxis: -60,
      }),
      flip(),
      shift(),
      size({
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `${availableWidth}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
      }),
    ],
  });

  const handleFilterIconClick = (headerId: string) => {
    if (filterMenuOpen === headerId) {
      setFilterMenuOpen(null);
      return;
    }

    const originalData = table.getCoreRowModel().rows.map((row) => {
      const value = row.getValue(headerId);
      const member = row.original;

      // if (headerId === "birthDate" || headerId === "startDate") {
      //   if (typeof value === "string" || typeof value === "number") {
      //     const dateValue = new Date(value);
      //     if (!isNaN(dateValue.getTime())) {
      //       return dateValue.toLocaleString("en-US", { month: "long" });
      //     }
      //   }
      //   return "No Data";
      // }

      // if (headerId === "teamId") {
      //   if (
      //     typeof member.team === "object" &&
      //     member.team !== null &&
      //     "name" in member.team
      //   ) {
      //     return member.team.name;
      //   }
      //   return "Not Assigned";
      // }

      // if (headerId === "position") {
      //   return value ? String(value) : "No Data";
      // }

      // if (headerId === "products") {
      //   const productCount = (member.products || []).length;
      //   return productCount.toString();
      // }

      return value ? String(value) : "No Data";
    });

    const filteredOptions = originalData.filter(
      (value, index, self) => self.indexOf(value) === index
    );

    const sortedOptions = filteredOptions.sort((a, b) => {
      // if (headerId === "birthDate" || headerId === "startDate") {
      //   const monthIndexA = MONTHS.indexOf(a);
      //   const monthIndexB = MONTHS.indexOf(b);
      //   if (a === "No Data") return 1;
      //   if (b === "No Data") return -1;
      //   return monthIndexA - monthIndexB;
      // }

      // if (headerId === "position" || headerId === "teamId") {
      //   if (a === "No Data" || a === "Not Assigned") return 1;
      //   if (b === "No Data" || b === "Not Assigned") return -1;
      //   return a.localeCompare(b, undefined, { sensitivity: "base" });
      // }

      // if (headerId === "products") {
      //   const numA = parseInt(a, 10);
      //   const numB = parseInt(b, 10);
      //   return numA - numB;
      // }

      return a.localeCompare(b);
    });

    if (sortedOptions.length === 0) {
      sortedOptions.push("No Data");
    }

    setFilterOptions(sortedOptions);
    setFilterMenuOpen(headerId);
  };

  const handleClearAllFilters = () => {
    setColumnFilters([]);
    setSelectedFilterOptions({});
    setClearAll((prev) => !prev);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <>
      {isLoading && <BarLoader />}
      <div className="relative h-full flex-grow flex flex-col gap-1">
        <div className="max-h-[50%] flex items-center">
          <Button
            onClick={handleClearAllFilters}
            variant="outline"
            size="sm"
            className="mr-2"
          >
            Clear All Filters
          </Button>
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
                      style={{ width: `${header.getSize()}px` }}
                      className="py-3 px-4 border-r text-start text-black font-semibold "
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
                          {header.column.getCanFilter() && (
                            <div
                              className="relative"
                              ref={(el) =>
                                (filterIconRefs.current[header.id] = el)
                              }
                            >
                              <DropDownArrow
                                className="cursor-pointer"
                                onClick={() => handleFilterIconClick(header.id)}
                              />

                              {filterMenuOpen === header.id && (
                                <div
                                  className="fixed z-40"
                                  ref={(el) =>
                                    (filterRefs.current[header.id] = el)
                                  }
                                  style={{
                                    position: strategy,
                                    top: y ?? 0,
                                    left: x ?? 0,
                                  }}
                                >
                                  <FilterComponent
                                    options={
                                      filterOptions.length > 0
                                        ? filterOptions
                                        : ["No Data"]
                                    }
                                    initialSelectedOptions={
                                      selectedFilterOptions[header.id] || []
                                    }
                                    onChange={(newSelectedOptions) =>
                                      handleFilterChange(
                                        header.id,
                                        newSelectedOptions
                                      )
                                    }
                                    onClearFilter={() => {
                                      setColumnFilters((prev) =>
                                        prev.filter((f) => f.id !== header.id)
                                      );

                                      // tableType === "members"
                                      //   ? handleFilterIconClickMembers(
                                      //       header.id
                                      //     )
                                      //   : handleFilterIconClickStock(header.id);
                                    }}
                                    onClose={() => setFilterMenuOpen(null)}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
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

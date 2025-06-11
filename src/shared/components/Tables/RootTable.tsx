"use client";
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
  Row,
} from "@tanstack/react-table";

import {
  useFloating,
  offset,
  flip,
  shift,
  size,
  detectOverflow,
  autoPlacement,
  autoUpdate,
} from "@floating-ui/react-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select" | "custom";
    filterPositon?: "inline" | "bottom";
    options?: string[] | ((rows: Row<TData>[]) => string[]);
  }
}
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { ProductTable } from "@/features/assets";
import { TableType } from "@/shared";
import { TableActions } from "./TableActions";
import { Button } from "@/shared";
import { ArrowLeft, ArrowRight, DropDownArrow } from "@/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectTrigger,
} from "@/shared";
import FilterComponent from "./Filters/FilterComponent";

import { PaginationAdvanced } from "@/shared";
import { Member } from "@/features/members";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getRowCanExpand?: () => boolean;
  renderSubComponent?: (row: TData) => ReactNode;
  tableType: TableType;
  pageSize?: number;
  tableNameRef?: string;
  onClearFilters?: () => void;
  onColumnFiltersChange?: (newFilters: ColumnFiltersState) => void;
  columnFilters?: ColumnFiltersState;
}

export function RootTable<TData, TValue>({
  columns,
  data,
  getRowCanExpand,
  renderSubComponent,
  tableType,
  pageSize = 5,
  tableNameRef,
  onClearFilters,
  onColumnFiltersChange,
  columnFilters: externalColumnFilters,
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

  const [filterMenuOpen, setFilterMenuOpen] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
  const filterIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const filterRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState<{
    [key: string]: string[];
  }>({});

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
  useEffect(() => {
    // console.log("Middleware Data:", middlewareData);
  }, [middlewareData]);

  const [clearAll, setClearAll] = useState(false);

  const handleClearAllFilters = () => {
    setColumnFilters([]);
    setSelectedFilterOptions({});
    setClearAll((prev) => !prev);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const handleColumnFiltersChange = (newFilters: ColumnFiltersState) => {
    setColumnFilters(newFilters);
    if (onColumnFiltersChange) {
      onColumnFiltersChange(newFilters);
    }
  };

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
    debugTable: false,
    columnResizeMode: "onChange",
    onPaginationChange: setPagination,
    getRowCanExpand,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: handleColumnFiltersChange,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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

  const handleFilterIconClickMembers = (headerId: string) => {
    if (filterMenuOpen === headerId) {
      setFilterMenuOpen(null);
      return;
    }

    const originalData = table.getCoreRowModel().rows.map((row) => {
      const value = row.getValue(headerId);
      const member = row.original as Member;

      if (headerId === "birthDate" || headerId === "startDate") {
        if (typeof value === "string" || typeof value === "number") {
          const dateValue = new Date(value);
          if (!isNaN(dateValue.getTime())) {
            return dateValue.toLocaleString("en-US", { month: "long" });
          }
        }
        return "No Data";
      }

      if (headerId === "teamId") {
        if (
          typeof member.team === "object" &&
          member.team !== null &&
          "name" in member.team
        ) {
          return member.team.name;
        }
        return "Not Assigned";
      }

      if (headerId === "position") {
        return value ? String(value) : "No Data";
      }

      if (headerId === "products") {
        const productCount = (member.products || []).length;
        return productCount.toString();
      }

      return value ? String(value) : "No Data";
    });

    const filteredOptions = originalData.filter(
      (value, index, self) => self.indexOf(value) === index
    );

    const sortedOptions = filteredOptions.sort((a, b) => {
      if (headerId === "birthDate" || headerId === "startDate") {
        const monthIndexA = MONTHS.indexOf(a);
        const monthIndexB = MONTHS.indexOf(b);
        if (a === "No Data") return 1;
        if (b === "No Data") return -1;
        return monthIndexA - monthIndexB;
      }

      if (headerId === "position" || headerId === "teamId") {
        if (a === "No Data" || a === "Not Assigned") return 1;
        if (b === "No Data" || b === "Not Assigned") return -1;
        return a.localeCompare(b, undefined, { sensitivity: "base" });
      }

      if (headerId === "products") {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        return numA - numB;
      }

      return a.localeCompare(b);
    });

    if (sortedOptions.length === 0) {
      sortedOptions.push("No Data");
    }

    setFilterOptions(sortedOptions);
    setFilterMenuOpen(headerId);
  };

  const handleFilterIconClickStock = (headerId: string) => {
    if (filterMenuOpen === headerId) {
      setFilterMenuOpen(null);
      return;
    }

    const filteredOptions = table
      .getCoreRowModel()
      .rows.map((row) => {
        const productTable = row.original as ProductTable;

        if (headerId === "Name") {
          const firstProduct = productTable.products[0];
          if (!firstProduct) return "No Data";

          const brand =
            firstProduct.attributes.find((attr) => attr.key === "brand")
              ?.value || "";
          const model =
            firstProduct.attributes.find((attr) => attr.key === "model")
              ?.value || "";
          const name = (firstProduct.name || "").trim();
          const color =
            firstProduct.attributes.find((attr) => attr.key === "color")
              ?.value || "";

          let result = brand;

          if (model === "Other") {
            result += name ? ` Other ${name}` : ` Other`;
          } else {
            result += ` ${model}`;
          }

          if (firstProduct.category === "Merchandising") {
            result = color ? `${name} (${color})` : name || "No Data";
          }

          return result || "No Data";
        }

        const value = row.getValue(headerId);
        if (headerId === "Category") {
          return productTable.category;
        }

        if (headerId === "serialNumber") {
          return value ? String(value) : "No Data";
        }

        if (headerId === "Acquisition Date ") {
          if (typeof value === "string" && value) {
            const dateValue = new Date(value);
            if (!isNaN(dateValue.getTime())) {
              return dateValue.toLocaleDateString("es-AR", { timeZone: "UTC" });
            }
          }
          return "No Data";
        }

        if (headerId === "currentlyWith") {
          return productTable.products[0]?.assignedMember || "No Data";
        }

        if (headerId === "Status + Product Condition") {
          const status = productTable.status || "No Data";
          const productCondition = productTable.productCondition || "Optimal";

          return `${status} - ${productCondition}`;
        }

        if (headerId === "location") {
          return productTable.products[0]?.location || "No Data";
        }

        return value ? String(value) : "No Data";
      })
      .filter((value, index, self) => self.indexOf(value) === index);

    const sortedOptions = filteredOptions.sort((a, b) => {
      if (headerId === "acquisitionDate") {
        const dateA = new Date(a).getTime();
        const dateB = new Date(b).getTime();
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateA - dateB;
      }

      if (
        ["Name", "currentlyWith", "Category", "Location"].includes(headerId)
      ) {
        if (a === "No Data" || a === "Not Assigned") return 1;
        if (b === "No Data" || b === "Not Assigned") return -1;
        return a.localeCompare(b, undefined, { sensitivity: "base" });
      }

      if (headerId === "serialNumber") {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        return numA - numB;
      }

      return a.localeCompare(b);
    });

    if (sortedOptions.length === 0) {
      sortedOptions.push("No Data");
    }

    setFilterOptions(sortedOptions);
    setFilterMenuOpen(headerId);
  };

  useEffect(() => {
    if (filterMenuOpen) {
      const filterElement = filterRefs.current[filterMenuOpen];
      const iconElement = filterIconRefs.current[filterMenuOpen];

      if (filterElement && iconElement) {
        refs.setReference(iconElement);
        refs.setFloating(filterElement);

        const cleanup = autoUpdate(iconElement, filterElement, update, {
          ancestorScroll: true,
          ancestorResize: true,
          elementResize: true,
          layoutShift: true,
        });

        return () => cleanup();
      }
    }
  }, [filterMenuOpen, refs, update]);

  useEffect(() => {
    const handleScroll = () => {
      if (filterMenuOpen) {
        setFilterMenuOpen(null);
      }
    };

    const containerRef = tableContainerRef.current;
    containerRef?.addEventListener("scroll", handleScroll);

    return () => {
      containerRef?.removeEventListener("scroll", handleScroll);
    };
  }, [filterMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterMenuOpen &&
        !filterIconRefs.current[filterMenuOpen]?.contains(
          event.target as Node
        ) &&
        !filterRefs.current[filterMenuOpen]?.contains(event.target as Node)
      ) {
        setFilterMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterMenuOpen]);

  useEffect(() => {
    if (onClearFilters) {
      onClearFilters();
    }
  }, [onClearFilters]);

  return (
    <div className="relative flex flex-col flex-grow gap-1 h-full">
      {tableType !== "subRow" && (
        <div className="flex items-center max-h-[50%]">
          <Button
            onClick={handleClearAllFilters}
            variant="secondary"
            size="small"
            className="mr-2 w-32"
          >
            Clear All Filters
          </Button>

          <TableActions
            table={table}
            type={tableType}
            onClearAllFilters={onClearFilters}
          />
        </div>
      )}
      <div
        ref={tableContainerRef}
        className={`rounded-md border w-full mx-auto ${
          tableType === "members" ? "max-h-[80%]" : "max-h-[85%] mt-2"
        } overflow-y-auto scrollbar-custom `}
      >
        <Table className="table">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-light-grey border-gray-200 rounded-md"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="px-4 py-3 border-r font-semibold text-black text-start"
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
                              onClick={() =>
                                tableType === "members"
                                  ? handleFilterIconClickMembers(header.id)
                                  : handleFilterIconClickStock(header.id)
                              }
                            />

                            {filterMenuOpen === header.id && (
                              <div
                                className="z-40 fixed"
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

                                    tableType === "members"
                                      ? handleFilterIconClickMembers(header.id)
                                      : handleFilterIconClickStock(header.id);
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    key={row.id}
                    className={`text-black border-b text-md border-gray-200 text-left ${
                      row.getIsExpanded() &&
                      "border-l-2 border-l-black bg-hoverBlue"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id} className="text-xs">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <tr className="border-l-2 border-l-black">
                      <td colSpan={row.getVisibleCells().length}>
                        {renderSubComponent && renderSubComponent(row.original)}
                        {/* <div>Subcomponent Placeholder</div> */}
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
        <div className="bottom-0 z-30 absolute flex justify-center w-full">
          <PaginationAdvanced
            pageIndex={table.getState().pagination.pageIndex}
            pageCount={table.getPageCount()}
            setPageIndex={(index) => table.setPageIndex(index)}
            pageSize={table.getState().pagination.pageSize}
            setPageSize={(size) => table.setPageSize(size)}
          />
        </div>
      )}
    </div>
  );
}

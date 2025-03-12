"use client";
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
import CreateAssetsTable from "./assets/CreateAssetTable";
import { ArrowRight, Button } from "@/common";
import CreateMembersTable from "./members/CreateMemberTable";
import CreateTeamsTable from "./teams/CreateTeamTable";
import DeleteAssetsTable from "./assets/DeleteAssetTable";
import DeleteTeamsTable from "./teams/DeleteTeamTable";
import DeleteMembersTable from "./members/DeleteMemberTable";
import ActionAssetTable from "./assets/ActionAssetTable";
import ActionTeamsTable from "./teams/ActionTeamTable";
import OffboardingMembersTable from "./members/OffboardingMemberTable";
import UpdateTeamsTable from "./teams/UpdateTeamTable";
import UpdateMembersTable from "./members/UpdateMemberTable";
import UpdateAssetsTable from "./assets/UpdateAssetTable";
import { HistorialResponse } from "@/action-history/interfaces";
import { setAuthInterceptor } from "@/config/axios.config";

const DEFAULT_PAGE_SIZE = 10;
const VALID_PAGE_SIZES = [10, 25, 50];

const fetchData = async (
  pageIndex: number,
  pageSize: number,
  startDate: Date,
  endDate: Date
) => {
  try {
    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();

    const token = sessionStorage.getItem("accessToken");
    if (token) setAuthInterceptor(token);

    return await HistorialServices.getAll(
      pageIndex,
      pageSize,
      startDateISO,
      endDateISO
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return { data: [], totalCount: 0 };
  }
};

const TableA = ({ data }: { data: any }) => (
  <div className="p-3 border rounded-md bg-gray-50">
    <p className="text-sm font-semibold">Table A (Example)</p>
    <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
  </div>
);

const TableB = ({ data }: { data: any }) => (
  <div className="p-3 border rounded-md bg-gray-50">
    <p className="text-sm font-semibold">Table B (Example)</p>
    <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
  </div>
);

interface Props {
  initialData: HistorialResponse;
}

const HistoryTable = ({ initialData }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState(initialData.data || []);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [selectedDates, setSelectedDates] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: startOfDay(subDays(new Date(), 7)),
    endDate: endOfDay(new Date()),
  });

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
    setIsLoading(true);

    fetchData(
      currentPage,
      pageSize,
      selectedDates.startDate,
      selectedDates.endDate
    ).then((result) => {
      setData(result.data);
      setTotalCount(result.totalCount);
      setIsLoading(false);

      const maxPage = Math.ceil(result.totalCount / pageSize);
      if (currentPage > maxPage && maxPage > 0) {
        router.replace(`?page=1&pageSize=${pageSize}`);
      }
    });
  }, [currentPage, pageSize, selectedDates]);

  const columns = useMemo(
    () => [
      { accessorKey: "_id", header: "Id Action" },
      { accessorKey: "itemType", header: "Item Type" },
      { accessorKey: "actionType", header: "Action" },
      {
        header: "Quantity",
        cell: ({ row }) => {
          return (
            row.original.changes?.newData?.length ||
            row.original.changes?.oldData?.length ||
            1
          );
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
      {
        id: "expander",
        header: () => null,
        size: 20,
        cell: ({ row }) => {
          const rowId = row.original._id;
          const { actionType, itemType } = row.original;

          if (
            (actionType === "unassign" && itemType === "teams") ||
            (actionType === "offboarding" && itemType === "members")
          ) {
            return null;
          }

          return (
            <Button
              variant="text"
              className="relative"
              onClick={() =>
                setExpandedRow(expandedRow === rowId ? null : rowId)
              }
            >
              <span>Details</span>
              <ArrowRight
                className={`transition-all duration-200 transform ${
                  expandedRow === rowId ? "rotate-90" : "rotate-0"
                }`}
              />
            </Button>
          );
        },
      },
    ],
    [expandedRow]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalCount,
  });

  return (
    <>
      {isLoading && <BarLoader />}
      <div className="relative h-full flex-grow flex flex-col gap-1">
        <div className="flex justify-end">
          <DateRangeDropdown
            setSelectedDates={setSelectedDates}
            selectedDates={selectedDates}
          />
        </div>
        <div className="max-h-[85%] overflow-y-auto scrollbar-custom rounded-md border w-full mx-auto">
          <Table className="w-full border-collapse m-0">
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
              {data.length === 0 ? (
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
                  <React.Fragment key={row.id}>
                    <TableRow
                      className={`text-black border-b text-md border-gray-200 text-left ${
                        expandedRow === row.original._id
                          ? "border-l-2 border-l-blue bg-blue/10 transition-colors"
                          : ""
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-xs">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {expandedRow === row.original._id && (
                      <TableRow
                        key={row.id}
                        className={`text-black border-b text-md border-gray-200 text-left 
                        ${
                          expandedRow === row.original._id
                            ? "border-l-2 border-l-blue"
                            : ""
                        }`}
                      >
                        <TableCell
                          colSpan={columns.length}
                          className="text-black border-b text-md text-left border-l-2 border-l-blue w-full p-0 rounded-none transition-colors"
                        >
                          {row.original.itemType === "assets" ? (
                            row.original.actionType === "create" ||
                            row.original.actionType === "bulk-create" ? (
                              <CreateAssetsTable
                                data={row.original.changes.newData || []}
                              />
                            ) : row.original.actionType === "delete" ? (
                              <DeleteAssetsTable
                                data={row.original.changes.oldData || []}
                              />
                            ) : row.original.actionType === "update" ? (
                              <UpdateAssetsTable
                                data={row.original.changes || []}
                              />
                            ) : [
                                "return",
                                "reassign",
                                "relocate",
                                "assign",
                              ].includes(row.original.actionType) ? (
                              <ActionAssetTable
                                data={row.original.changes || []}
                              />
                            ) : null
                          ) : row.original.itemType === "members" ? (
                            row.original.actionType === "create" ||
                            row.original.actionType === "bulk-create" ? (
                              <CreateMembersTable
                                data={row.original.changes.newData || []}
                              />
                            ) : row.original.actionType === "delete" ? (
                              <DeleteMembersTable
                                data={row.original.changes.oldData || []}
                              />
                            ) : row.original.actionType === "update" ? (
                              <UpdateMembersTable
                                data={row.original.changes || []}
                              />
                            ) : row.original.actionType === "offboarding" ? (
                              <OffboardingMembersTable
                                data={row.original.changes || []}
                              />
                            ) : null
                          ) : row.original.itemType === "teams" ? (
                            row.original.actionType === "create" ||
                            row.original.actionType === "bulk-create" ? (
                              <CreateTeamsTable
                                data={row.original.changes.newData || []}
                              />
                            ) : row.original.actionType === "bulk-delete" ||
                              row.original.actionType === "delete" ? (
                              <DeleteTeamsTable
                                data={row.original.changes.oldData || []}
                              />
                            ) : row.original.actionType === "update" ? (
                              <UpdateTeamsTable
                                data={row.original.changes || []}
                              />
                            ) : ["reassign", "assign", "unassign"].includes(
                                row.original.actionType
                              ) ? (
                              <ActionTeamsTable
                                data={row.original.changes || []}
                              />
                            ) : null
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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

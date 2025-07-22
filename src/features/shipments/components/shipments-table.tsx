"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
} from "@/shared";

import { PaginationWithLinks } from "@/shared";
import { ArrowRight, Button } from "@/shared";
import { Loader } from "@/shared";
import {
  ShipmentServices,
  ShipmentDetailsTable,
  useFetchShipments,
  EditShipment,
  useShipmentStore,
} from "@/features/shipments";
import { DeleteAction } from "@/shared";
import { ExternalLinkIcon } from "lucide-react";

const DEFAULT_PAGE_SIZE = 10;
const VALID_PAGE_SIZES = [10, 25, 50];

const statusColors = {
  "In Preparation": "bg-lightPurple",
  "On The Way": "bg-lightBlue",
  Received: "bg-lightGreen",
  Cancelled: "bg-[#FFC6D3]",
  "On Hold - Missing Data": "bg-[#FF8A80]",
};

export const ShipmentsTable = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shipmentId = searchParams.get("id");

  const expandedShipmentId = useShipmentStore(
    (state) => state.expandedShipmentId
  );

  const setExpandedShipmentId = useShipmentStore(
    (state) => state.setExpandedShipmentId
  );

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const rawPageSize = parseInt(
    searchParams.get("pageSize") || `${DEFAULT_PAGE_SIZE}`,
    10
  );

  let pageSize = VALID_PAGE_SIZES.includes(rawPageSize)
    ? rawPageSize
    : DEFAULT_PAGE_SIZE;
  let currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const { data, isLoading } = useFetchShipments(currentPage, pageSize);

  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (shipmentId) {
      setExpandedShipmentId(shipmentId);
    }
  }, [shipmentId, setExpandedShipmentId]);

  useEffect(() => {
    if (!initialLoadDone && shipmentId && data?.data) {
      const shipmentIndex = data.data.findIndex((s) => s._id === shipmentId);
      if (shipmentIndex === -1 && !isLoading) {
        ShipmentServices.findShipmentPage(shipmentId, pageSize)
          .then((response) => {
            if (response.page) {
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", response.page.toString());
              router.push(`/home/shipments?${params.toString()}`);
              setInitialLoadDone(true);
            }
          })
          .catch(console.error);
      } else {
        setInitialLoadDone(true);
      }
    }
  }, [
    shipmentId,
    data,
    isLoading,
    pageSize,
    router,
    searchParams,
    initialLoadDone,
  ]);

  const shipments = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;

  const columns = useMemo(
    () => [
      {
        accessorKey: "order_id",
        header: "Order ID",
        size: 100,
        style: { width: "150px", minWidth: "150px", maxWidth: "150px" },
      },
      {
        accessorKey: "order_date",
        header: "Order Date",
        size: 100,
        style: { width: "120px", minWidth: "120px", maxWidth: "120px" },
        cell: (info) => {
          const date = new Date(info.getValue());
          return date.toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        },
      },
      {
        accessorKey: "quantity_products",
        header: "Quantity Products",
        size: 100,
      },
      {
        accessorKey: "shipment_type",
        header: "Type",
        size: 100,
      },
      {
        accessorKey: "shipment_status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.shipment_status;
          const isClickable = Boolean(
            row.original.shipment_type === "Courrier" &&
              (status === "On The Way" || status === "Received") &&
              row.original.trackingURL
          );

          return (
            <div
              className={`inline-flex items-center ${
                statusColors[status]
              } text-black px-2 py-1 rounded-md ${
                isClickable ? "cursor-pointer hover:bg-opacity-80" : ""
              }`}
              onClick={() => {
                if (isClickable) {
                  window.open(row.original.trackingURL, "_blank");
                }
              }}
            >
              <span>{status}</span>
              {isClickable && <ExternalLinkIcon className="ml-1 w-3 h-3" />}
            </div>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        size: 100,
        style: { width: "100px", minWidth: "100px", maxWidth: "100px" },
        cell: ({ row }) => {
          const { amount, currencyCode } = row.original.price;

          if (amount === null) return <span>-</span>;
          if (amount === 0) return <span>FREE</span>;
          return <span>{`${amount} ${currencyCode}`}</span>;
        },
      },
      {
        accessorKey: "",
        id: "actions",
        header: "Actions",
        size: 80,
        style: { width: "80px", minWidth: "80px", maxWidth: "80px" },
        cell: ({ row }) => {
          const isDisabled =
            row.original.shipment_status !== "In Preparation" &&
            row.original.shipment_status !== "On Hold - Missing Data";

          return (
            <div className="flex gap-1">
              <EditShipment shipment={row.original} isDisabled={isDisabled} />
              <DeleteAction
                type="shipment"
                id={row.original._id}
                disabled={isDisabled}
              />
            </div>
          );
        },
      },
      {
        id: "expander",
        header: () => null,
        size: 100,
        style: { width: "100px", minWidth: "100px", maxWidth: "100px" },
        cell: ({ row }) => {
          const rowId = row.original._id;
          return (
            <Button
              variant="text"
              className="relative"
              onClick={() =>
                setExpandedShipmentId(
                  expandedShipmentId === rowId ? null : rowId
                )
              }
            >
              <span>Details</span>
              <ArrowRight
                className={`transition-all duration-200 transform ${
                  expandedShipmentId === rowId ? "rotate-90" : "rotate-0"
                }`}
              />
            </Button>
          );
        },
      },
    ],
    [expandedShipmentId]
  );

  const table = useReactTable({
    data: shipments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalCount,
  });

  // Ref para el row expandido y el contenedor scrollable
  const expandedRowRef = useRef<HTMLTableRowElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isExpandedShipmentInData = shipments.some(
      (s) => s._id === expandedShipmentId
    );

    if (
      expandedShipmentId &&
      isExpandedShipmentInData &&
      !isLoading &&
      initialLoadDone
    ) {
      const timeoutId = setTimeout(() => {
        const row = expandedRowRef.current;
        if (row) {
          row.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [expandedShipmentId, shipments, isLoading, initialLoadDone]);

  return (
    <>
      <div className="relative flex flex-col flex-grow gap-1 h-full">
        <div
          className="mx-auto border rounded-md w-full max-h-[85%] overflow-y-auto scrollbar-custom"
          ref={scrollContainerRef}
        >
          <Table className="m-0 w-full border-collapse">
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
                        width: header.getSize() ? header.getSize() : undefined,
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
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-8 text-center"
                  >
                    <Loader />
                  </TableCell>
                </TableRow>
              ) : shipments.length === 0 ? (
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
                      ref={
                        expandedShipmentId === row.original._id
                          ? expandedRowRef
                          : undefined
                      }
                      className={`text-black border-b text-md border-gray-200 text-left ${
                        expandedShipmentId === row.original._id
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
                    {expandedShipmentId === row.original._id && (
                      <TableRow
                        key={row.id}
                        className={`text-black border-b text-md border-gray-200 text-left 
                        ${
                          expandedShipmentId === row.original._id
                            ? "border-l-2 border-l-blue"
                            : ""
                        }`}
                      >
                        <TableCell
                          colSpan={columns.length}
                          className="p-0 border-b border-l-2 border-l-blue rounded-none w-full text-black text-md text-left transition-colors"
                        >
                          <ShipmentDetailsTable data={row.original} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bottom-0 z-30 absolute flex justify-center w-full">
          {shipments.length > 0 && !isLoading && (
            <PaginationWithLinks
              page={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              pageSizeSelectOptions={{ pageSizeOptions: VALID_PAGE_SIZES }}
            />
          )}
        </div>
      </div>
    </>
  );
};

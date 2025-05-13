import React, { useEffect, useMemo, useState } from "react";
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
} from "@/components/ui/table";

import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import { ArrowRight, Button, PenIcon, TrashIcon } from "@/common";
import { Loader } from "@/components/Loader";
import { ShipmentServices } from "@/shipments/services/shipments.services";
import { DeleteAction } from "@/components/Alerts";
import ShipmentDetailsTable from "./ShipmentDetailsTable";
import { useFetchShipments } from "@/shipments/hooks/useFetchShipments";
import { EditShipment } from "../EditShipment";
import { useShipmentStore } from "@/shipments/store/useShipmentStore";

const DEFAULT_PAGE_SIZE = 10;
const VALID_PAGE_SIZES = [10, 25, 50];

const ShipmentsTable = () => {
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
      },
      {
        accessorKey: "price",
        header: "Price",
        size: 100,
        style: { width: "100px", minWidth: "100px", maxWidth: "100px" },
        cell: ({ row }) => {
          const amount = row.original.price.amount;
          return <span>{amount ? `$${amount}` : "-"}</span>;
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

  return (
    <>
      <div className="relative h-full flex-grow flex flex-col gap-1">
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
                    className="text-center py-8"
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
                          className="text-black border-b text-md text-left border-l-2 border-l-blue w-full p-0 rounded-none transition-colors"
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

        <div className="flex justify-center absolute w-full bottom-0 z-30">
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

export default ShipmentsTable;

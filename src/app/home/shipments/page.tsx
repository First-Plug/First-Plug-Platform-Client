"use client";

import { PageLayout, BarLoader, Button, PaginationAdvanced } from "@/shared";
import { DataTable } from "@/features/fp-tables";
import {
  EmptyShipments,
  useFetchAllShipments,
  useShipmentsTable,
  useShipmentsTableColumns,
  ShipmentDetailsTable,
} from "@/features/shipments";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function Shipments() {
  const searchParams = useSearchParams();
  const shipmentId = searchParams.get("id");
  const hasProcessedIdRef = useRef(false);

  const { data: allShipments, isLoading } = useFetchAllShipments();

  useEffect(() => {
    hasProcessedIdRef.current = false;
  }, []);

  useEffect(() => {
    hasProcessedIdRef.current = false;
  }, [shipmentId, searchParams.toString()]);

  const {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    paginatedShipments,
    tableContainerRef,
    useShipmentsTableFilterStore,
    getRowCanExpand,
    getRowId,
    scrollToAndExpandRow,
  } = useShipmentsTable(allShipments || []);

  const columns = useShipmentsTableColumns({
    shipments: allShipments || [],
  });

  useEffect(() => {
    if (
      shipmentId &&
      allShipments &&
      allShipments.length > 0 &&
      !hasProcessedIdRef.current
    ) {
      const targetShipment = allShipments.find(
        (shipment) => shipment._id === shipmentId
      );

      if (targetShipment) {
        hasProcessedIdRef.current = true;

        handleClearAllFilters();

        setTimeout(() => {
          scrollToAndExpandRow(shipmentId);
        }, 100);
      } else {
        hasProcessedIdRef.current = true;
      }
    }
  }, [shipmentId, allShipments]);

  const renderSubComponent = (row: any) => {
    return (
      <div className="bg-white w-full">
        <ShipmentDetailsTable data={row.original} />
      </div>
    );
  };

  return (
    <PageLayout>
      {isLoading && !allShipments && <BarLoader />}

      {allShipments && allShipments.length > 0 ? (
        <div className="flex flex-col h-full max-h-full">
          <div className="flex items-center mb-4 max-h-[50%]">
            <Button
              onClick={handleClearAllFilters}
              variant="secondary"
              size="small"
              className="w-32"
            >
              Clear All Filters
            </Button>
          </div>

          <div className="flex-1 min-h-0">
            <DataTable
              columns={columns}
              data={paginatedShipments}
              useFilterStore={useShipmentsTableFilterStore}
              rowHeight={43.5}
              scrollContainerRef={tableContainerRef}
              getRowCanExpand={getRowCanExpand}
              renderSubComponent={renderSubComponent}
              getRowId={getRowId}
              adaptiveHeight={false}
              enableSnapScroll={false}
            />
          </div>

          <div className="mt-2">
            <PaginationAdvanced
              pageIndex={pageIndex}
              pageCount={totalPages}
              setPageIndex={handlePageChange}
              pageSize={pageSize}
              setPageSize={handlePageSizeChange}
            />
          </div>
        </div>
      ) : allShipments && allShipments.length === 0 ? (
        <EmptyShipments />
      ) : null}
    </PageLayout>
  );
}

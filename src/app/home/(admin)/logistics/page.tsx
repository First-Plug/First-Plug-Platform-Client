"use client";

import {
  PageLayout,
  BarLoader,
  Button,
  PaginationAdvanced,
  DownloadIcon,
} from "@/shared";
import { DataTable } from "@/features/fp-tables";
import {
  EmptyLogistics,
  useLogisticsTable,
  useLogisticsTableColumns,
  useLogisticsSubtableLogic,
  useFetchAllLogisticsShipments,
  LogisticsTableActions,
} from "@/features/logistics";
import { TruckIcon } from "lucide-react";
import { exportToCsv, createLogisticsCsvConfig } from "@/shared";

export default function Logistics() {
  const {
    data: shipments,
    isLoading,
    error,
    isFetching,
  } = useFetchAllLogisticsShipments();

  const {
    data,
    paginatedData,
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    useLogisticsTableFilterStore,
    tableContainerRef,
  } = useLogisticsTable(shipments, isLoading);

  const columns = useLogisticsTableColumns({ data: data || [] });

  const { getRowCanExpand, getRowId, renderSubComponent } =
    useLogisticsSubtableLogic();

  const handleExportCsv = () => {
    if (!shipments || shipments.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }

    const csvConfig = createLogisticsCsvConfig();
    exportToCsv(shipments, csvConfig, {
      filename: "logistics-shipments",
      includeTimestamp: true,
    });
  };

  return (
    <PageLayout>
      {(isLoading || isFetching) && <BarLoader />}

      <div className="flex flex-col h-full max-h-full">
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={handleClearAllFilters}
            variant="secondary"
            size="small"
            className="w-32"
          >
            Clear All Filters
          </Button>
          <div className="flex flex-col justify-end items-end gap-2">
            <div className="flex justify-end items-center gap-4">
              <Button
                onClick={handleExportCsv}
                variant="secondary"
                size="small"
                icon={<DownloadIcon />}
                className="w-32"
              >
                Export CSV
              </Button>

              <LogisticsTableActions />
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              <TruckIcon className="w-4 h-4" />
              <span className="text-sm">
                {shipments?.length || 0} total shipments |{" "}
                {paginatedData?.length || 0} shown
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            data={paginatedData}
            useFilterStore={useLogisticsTableFilterStore}
            rowHeight={59}
            scrollContainerRef={tableContainerRef}
            getRowCanExpand={getRowCanExpand}
            renderSubComponent={renderSubComponent}
            getRowId={getRowId}
            adaptiveHeight={false}
            enableSnapScroll={false}
          />
        </div>

        <div className="mt-4 pt-4">
          <PaginationAdvanced
            pageIndex={pageIndex}
            pageCount={totalPages}
            setPageIndex={handlePageChange}
            pageSize={pageSize}
            setPageSize={handlePageSizeChange}
          />
        </div>
      </div>
    </PageLayout>
  );
}

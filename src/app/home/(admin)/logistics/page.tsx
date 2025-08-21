"use client";

import { PageLayout, BarLoader, Button, PaginationAdvanced } from "@/shared";
import { DataTable } from "@/features/fp-tables";
import {
  EmptyLogistics,
  useLogisticsTable,
  useLogisticsTableColumns,
  useLogisticsSubtableLogic,
  useExportLogisticsCsv,
} from "@/features/logistics";
import { DownloadIcon } from "@/shared";
import { TruckIcon } from "lucide-react";

export default function Logistics() {
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
    isLoading,
  } = useLogisticsTable();

  const columns = useLogisticsTableColumns({ data: data || [] });

  const { getRowCanExpand, getRowId, renderSubComponent } =
    useLogisticsSubtableLogic();

  const exportCsvMutation = useExportLogisticsCsv();

  const handleExportCsv = async () => {
    try {
      await exportCsvMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to export CSV:", error);
    }
  };

  return (
    <>
      <PageLayout>
        {isLoading && <BarLoader />}

        {!isLoading && data && data.length > 0 ? (
          <div className="flex flex-col h-full max-h-full">
            <div className="flex justify-between items-center mb-6">
              <Button
                onClick={handleClearAllFilters}
                variant="secondary"
                size="small"
                className="w-32"
              >
                Clear Filters
              </Button>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleExportCsv}
                  variant="secondary"
                  size="small"
                  icon={<DownloadIcon />}
                  className="w-32"
                  disabled={exportCsvMutation.isPending}
                >
                  Export CSV
                </Button>

                <div className="flex items-center gap-2 text-gray-500">
                  <TruckIcon className="w-4 h-4" />
                  <span className="text-sm">
                    {data.length} total shipments | {paginatedData.length} shown
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
        ) : !isLoading && data && data.length === 0 ? (
          <EmptyLogistics />
        ) : null}
      </PageLayout>
    </>
  );
}

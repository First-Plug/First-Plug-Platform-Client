"use client";

import { PageLayout, BarLoader, Button, PaginationAdvanced } from "@/shared";
import { DataTable } from "@/features/fp-tables";
import {
  EmptyLogistics,
  useLogisticsTable,
  useLogisticsTableColumns,
  useLogisticsSubtableLogic,
} from "@/features/logistics";

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

  return (
    <>
      <PageLayout>
        {isLoading && <BarLoader />}

        {!isLoading && data && data.length > 0 ? (
          <div className="flex flex-col h-full max-h-full">
            <div className="flex items-center mb-6">
              <Button
                onClick={handleClearAllFilters}
                variant="secondary"
                size="small"
                className="w-32"
              >
                Clear Filters
              </Button>
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

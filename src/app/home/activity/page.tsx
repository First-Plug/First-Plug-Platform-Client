"use client";

import { PageLayout, BarLoader, PaginationAdvanced } from "@/shared";
import { DataTable } from "@/features/fp-tables";

import {
  EmptyActivity,
  useActivityTable,
  useActivityTableColumns,
  ActivityTableActions,
  useActivitySubtableLogic,
} from "@/features/activity";

export default function ActionHistoryPage() {
  const {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    tableData,
    totalCount,
    isLoading,
    tableContainerRef,
    useActivityTableFilterStore,
  } = useActivityTable();

  const columns = useActivityTableColumns();

  const {
    getRowCanExpand,
    getRowId,
    renderSubComponent,
    handleClearSubtableFilters,
  } = useActivitySubtableLogic();

  const hasAnyData = totalCount > 0;
  const showEmptyState = !isLoading && !hasAnyData;

  return (
    <PageLayout>
      {isLoading && <BarLoader />}

      {!isLoading && (
        <div className="flex flex-col h-full">
          <ActivityTableActions />

          <div className="flex-1 min-h-0">
            {hasAnyData ? (
              <div className="flex flex-col h-full">
                <div
                  className="flex-1 min-h-0"
                  style={{ height: "calc(100% - 80px)" }}
                >
                  <DataTable
                    columns={columns}
                    data={tableData}
                    useFilterStore={useActivityTableFilterStore}
                    rowHeight={60}
                    scrollContainerRef={tableContainerRef}
                    getRowCanExpand={getRowCanExpand}
                    renderSubComponent={renderSubComponent}
                    getRowId={getRowId}
                    adaptiveHeight={false}
                    enableSnapScroll={false}
                  />
                </div>

                <div className="mt-2 pt-6">
                  <PaginationAdvanced
                    pageIndex={pageIndex}
                    pageCount={totalPages}
                    setPageIndex={handlePageChange}
                    pageSize={pageSize}
                    setPageSize={handlePageSizeChange}
                  />
                </div>
              </div>
            ) : (
              <EmptyActivity />
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
}

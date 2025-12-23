"use client";

import {
  PageLayout,
  BarLoader,
  Button,
  PaginationAdvanced,
  EmptyCard,
  EmptyCardLayout,
} from "@/shared";
import { DataTable } from "@/features/fp-tables";
import {
  useQuotesTable,
  useQuotesTableColumns,
  useQuotesSubtableLogic,
  QuotesTableActions,
} from "@/features/quotes";

export default function QuoteHistoryPage() {
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
    useQuotesTableFilterStore,
  } = useQuotesTable();

  const { getRowCanExpand, renderSubComponent, getRowId } =
    useQuotesSubtableLogic();

  const columns = useQuotesTableColumns({ quotes: tableData });

  const hasAnyData = totalCount > 0;
  const showEmptyState = !isLoading && !hasAnyData;

  return (
    <PageLayout>
      {isLoading && <BarLoader />}

      {!isLoading && (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <Button
              onClick={handleClearAllFilters}
              variant="secondary"
              size="small"
              className="w-32"
            >
              Clear all Filters
            </Button>
            <QuotesTableActions />
          </div>

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
                    useFilterStore={useQuotesTableFilterStore}
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
              <EmptyCardLayout>
                <EmptyCard type="quotesHistory" />
              </EmptyCardLayout>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
}

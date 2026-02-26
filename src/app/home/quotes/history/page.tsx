"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

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
    isFetching,
    tableContainerRef,
    useQuotesTableFilterStore,
  } = useQuotesTable();

  // Cuando venimos de submit exitoso: refetch, reset a página 1, y expandir la primera fila (la nueva quote)
  // Esperamos a que termine el refetch (!isFetching) para tener datos frescos; si no, expandiríamos la fila que era primera con datos cacheados
  useEffect(() => {
    if (searchParams.get("fromSubmit") !== "1") return;

    queryClient.invalidateQueries({ queryKey: ["quotes-history"] });
    handlePageChange(0);

    if (!isLoading && !isFetching && tableData.length > 0) {
      const firstRowId = tableData[0]._id;
      useQuotesTableFilterStore.getState().setExpandedRows({
        [firstRowId]: true,
      });
      router.replace("/home/quotes/history", { scroll: false });
    }
  }, [
    searchParams,
    queryClient,
    handlePageChange,
    router,
    tableData,
    isLoading,
    isFetching,
  ]);

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

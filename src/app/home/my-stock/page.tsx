"use client";

import { PageLayout, BarLoader, Button, PaginationAdvanced } from "@/shared";

import { DataTable } from "@/features/fp-tables";

import {
  EmptyStock,
  useGetTableAssets,
  useAssetsTable,
  useAssetsTableColumns,
  TableStockActions,
  useSubtableLogic,
} from "@/features/assets";

export default function MyAssets() {
  const { data: assets, isLoading } = useGetTableAssets();

  const {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    paginatedAssets,
    tableContainerRef,
    useAssetsTableFilterStore,
  } = useAssetsTable(assets || []);

  const columns = useAssetsTableColumns({ assets: assets || [] });

  const {
    getRowCanExpand,
    getRowId,
    renderSubComponent,
    handleClearSubtableFilters,
  } = useSubtableLogic();

  const handleClearAllFiltersExtended = () => {
    handleClearAllFilters();
    handleClearSubtableFilters();
  };

  return (
    <PageLayout>
      {isLoading && <BarLoader />}

      {!isLoading && assets && assets.length > 0 ? (
        <div className="flex flex-col h-full max-h-full">
          <div className="flex items-center mb-4 max-h-[50%]">
            <Button
              onClick={handleClearAllFiltersExtended}
              variant="secondary"
              size="small"
              className="mr-2 w-32"
            >
              Clear All Filters
            </Button>

            <TableStockActions />
          </div>

          <div className="flex-1 min-h-0">
            <DataTable
              columns={columns}
              data={paginatedAssets}
              useFilterStore={useAssetsTableFilterStore}
              rowHeight={46}
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
      ) : !isLoading && assets && assets.length === 0 ? (
        <EmptyStock />
      ) : null}
    </PageLayout>
  );
}

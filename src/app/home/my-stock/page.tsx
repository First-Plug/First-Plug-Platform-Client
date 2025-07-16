"use client";

import { PageLayout, BarLoader, Button, PaginationAdvanced } from "@/shared";
import { useGetTableAssets } from "@/features/assets";
import { useAssetsTable } from "@/features/assets/hooks/useAssetsTable";
import { useAssetsTableColumns } from "@/features/assets/hooks/useAssetsTableColumns";
import { DataTable } from "@/features/fp-tables";
import { EmptyStock } from "@/features/assets";
import TableStockActions from "@/shared/components/Tables/TableActions/TableStockActions";
import { ProductTable } from "@/features/assets/interfaces/product";
import { Row } from "@tanstack/react-table";
import ProdcutsDetailsTable from "@/shared/components/Tables/Product/ProdcutsDetailsTable";

export default function MyStock() {
  const { data: assets = [], isLoading } = useGetTableAssets();

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

  const getRowCanExpand = (row: Row<ProductTable>) => {
    return row.original.products && row.original.products.length > 0;
  };

  const renderSubComponent = (row: Row<ProductTable>) => {
    const products = row.original.products.filter(
      (product) => product.status !== "Deprecated"
    );

    return (
      <div className="bg-white w-full">
        <ProdcutsDetailsTable products={products} clearAll={false} />
      </div>
    );
  };

  return (
    <PageLayout>
      {isLoading && <BarLoader />}

      {assets && assets.length > 0 ? (
        <div className="flex flex-col h-full max-h-full">
          <div className="flex items-center mb-2 max-h-[50%]">
            <Button
              onClick={handleClearAllFilters}
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
      ) : (
        <EmptyStock />
      )}
    </PageLayout>
  );
}

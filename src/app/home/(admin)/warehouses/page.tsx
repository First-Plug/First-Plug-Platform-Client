"use client";

import {
  AddIcon,
  Button,
  PageLayout,
  PaginationAdvanced,
  useAsideStore,
} from "@/shared";

import { DataTable } from "@/features/fp-tables";
import {
  useWarehousesTable,
  useWarehousesTableColumns,
} from "@/features/warehouses";

export default function WarehousesPage() {
  const { setAside } = useAsideStore();

  const {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    paginatedWarehouses,
    tableContainerRef,
    useWarehousesTableFilterStore,
    filteredDataForColumns,
  } = useWarehousesTable();

  const columns = useWarehousesTableColumns({
    warehouses: filteredDataForColumns,
  });

  return (
    <PageLayout>
      <div className="flex flex-col h-full max-h-full">
        <div className="flex justify-between items-center mb-4">
          <Button
            size="small"
            variant="secondary"
            body="Clear All Filters"
            onClick={handleClearAllFilters}
          />

          <Button
            size="small"
            variant="primary"
            body="Create Warehouse"
            icon={<AddIcon />}
            onClick={() => setAside("CreateWarehouse")}
          />
        </div>

        {/* Tabla */}
        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            data={paginatedWarehouses}
            useFilterStore={useWarehousesTableFilterStore}
            scrollContainerRef={tableContainerRef}
            rowHeight={56}
            adaptiveHeight={false}
            enableSnapScroll={false}
          />
        </div>

        {/* Paginación */}
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
    </PageLayout>
  );
}

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
import { useWarehousesSubtableLogic } from "@/features/warehouses/hooks/useWarehousesSubtableLogic";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";

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
    tenantFilterOptions,
    selectedTenantName,
    handleSetTenantFilter,
  } = useWarehousesTable();

  const columns = useWarehousesTableColumns({
    warehouses: filteredDataForColumns,
  });

  const { getRowCanExpand, getRowId, renderSubComponent } =
    useWarehousesSubtableLogic();

  return (
    <PageLayout>
      <div className="flex flex-col h-full max-h-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-64">
              <Select
                value={selectedTenantName || "all"}
                onValueChange={(v) =>
                  v === "all"
                    ? handleSetTenantFilter(undefined)
                    : handleSetTenantFilter(v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {selectedTenantName || "Filter by tenant"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All tenants</SelectItem>
                  {tenantFilterOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="small"
              variant="secondary"
              body="Clear All Filters"
              onClick={handleClearAllFilters}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            data={paginatedWarehouses}
            useFilterStore={useWarehousesTableFilterStore}
            scrollContainerRef={tableContainerRef}
            getRowCanExpand={getRowCanExpand}
            getRowId={getRowId}
            renderSubComponent={renderSubComponent}
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

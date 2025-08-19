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
  useTenantsTable,
  useTenantsTableColumns,
  EmptyTenants,
  useTenantsSubtableLogic,
} from "@/features/tenants";

export default function TenantsPage() {
  const { setAside } = useAsideStore();

  const {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    paginatedTenants,
    tableContainerRef,
    useTenantsTableFilterStore,
    filteredDataForColumns,
  } = useTenantsTable();

  const columns = useTenantsTableColumns({
    tenants: filteredDataForColumns,
  });

  const { getRowCanExpand, getRowId, renderSubComponent } =
    useTenantsSubtableLogic();

  const handleClearAllFiltersExtended = () => {
    handleClearAllFilters();
  };

  if (paginatedTenants.length === 0 && pageIndex === 0) {
    return <EmptyTenants />;
  }

  return (
    <PageLayout>
      <div className="flex flex-col h-full max-h-full">
        <div className="flex justify-between items-center mb-4 max-h-[50%]">
          <Button
            onClick={handleClearAllFiltersExtended}
            variant="secondary"
            size="small"
            className="mr-2 w-32"
          >
            Clear all Filters
          </Button>

          <Button
            size="small"
            variant="secondary"
            body="Create Tenant"
            icon={<AddIcon />}
            onClick={() => setAside("CreateTenant")}
          />
        </div>

        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            data={paginatedTenants}
            useFilterStore={useTenantsTableFilterStore}
            scrollContainerRef={tableContainerRef}
            getRowCanExpand={getRowCanExpand}
            getRowId={getRowId}
            renderSubComponent={renderSubComponent}
            rowHeight={56}
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
    </PageLayout>
  );
}

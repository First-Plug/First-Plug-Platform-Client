"use client";

import { PageLayout, BarLoader, Button, PaginationAdvanced } from "@/shared";
import { DataTable } from "@/features/fp-tables";
import {
  useAssignedUsersTable,
  useAssignedUsersTableColumns,
} from "@/features/assigned-users";

export default function AssignedUsersPage() {
  const {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    paginatedUsers,
    tableContainerRef,
    useAssignedUsersTableFilterStore,
    filteredDataForColumns,
    isLoading,
    isFetching,
  } = useAssignedUsersTable();

  const columns = useAssignedUsersTableColumns({
    users: filteredDataForColumns,
  });

  return (
    <PageLayout>
      {(isLoading || isFetching) && <BarLoader />}

      <div className="flex flex-col h-full max-h-full">
        <div className="flex items-center mb-4 max-h-[50%]">
          <Button
            onClick={handleClearAllFilters}
            variant="secondary"
            size="small"
            className="mr-2 w-32"
          >
            Clear all Filters
          </Button>
        </div>

        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            data={paginatedUsers}
            useFilterStore={useAssignedUsersTableFilterStore}
            rowHeight={56}
            scrollContainerRef={tableContainerRef}
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

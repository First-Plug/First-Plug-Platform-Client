"use client";

import { PageLayout, BarLoader, Button, PaginationAdvanced } from "@/shared";
import {
  EmptyMembers,
  useFetchMembers,
  useMembersTable,
  useMembersTableColumns,
} from "@/features/members";
import { DataTable } from "@/features/fp-tables";
import { MyTeamActions } from "@/features/teams";

export default function MyTeam() {
  const { data: members, isLoading: isLoadingMembers } = useFetchMembers();

  const {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    paginatedMembers,
    tableContainerRef,
    useMembersTableFilterStore,
  } = useMembersTable(members || []);

  const columns = useMembersTableColumns({ members: members || [] });

  return (
    <PageLayout>
      {isLoadingMembers && !members && <BarLoader />}

      {members && members.length > 0 ? (
        <div className="flex flex-col h-full max-h-full">
          <div className="flex items-center mb-2 max-h-[50%]">
            <Button
              onClick={handleClearAllFilters}
              variant="secondary"
              size="small"
              className="mr-2 w-36"
            >
              Clear All Filters
            </Button>

            <MyTeamActions />
          </div>

          <div className="flex-1 min-h-0">
            <DataTable
              columns={columns}
              data={paginatedMembers}
              useFilterStore={useMembersTableFilterStore}
              rowHeight={56.2}
              scrollContainerRef={tableContainerRef}
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
      ) : members && members.length === 0 ? (
        <EmptyMembers />
      ) : null}
    </PageLayout>
  );
}

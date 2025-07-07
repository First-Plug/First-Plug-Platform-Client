"use client";

import {
  PageLayout,
  BarLoader,
  TeamCard,
  Button,
  PaginationAdvanced,
  ElipsisVertical,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  PenIcon,
  DeleteAction,
} from "@/shared";
import {
  ActionsTableMembers,
  EmptyMembers,
  Member,
  useFetchMembers,
} from "@/features/members";
import {
  createFilterStore,
  DataTable,
  usePagination,
} from "@/features/fp-tables";

import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useEffect, useCallback } from "react";
import FormatedDate from "@/shared/components/Tables/helpers/FormatedDate";
import { MyTeamActions } from "@/features/teams";

const useMembersTableFilterStore = createFilterStore();

const months = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

export default function MyTeam() {
  const filters = useMembersTableFilterStore((s) => s.filters);
  const setOnFiltersChange = useMembersTableFilterStore(
    (s) => s.setOnFiltersChange
  );
  const {
    pageIndex,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetToFirstPage,
    tableContainerRef,
  } = usePagination();

  // Configurar el callback para resetear la paginación cuando cambien los filtros
  useEffect(() => {
    setOnFiltersChange(() => {
      resetToFirstPage();
    });
  }, [setOnFiltersChange, resetToFirstPage]);

  const { data: members, isLoading, isFetching } = useFetchMembers();

  const isLoadingMembers = isLoading || isFetching;
  const hasMembers = members?.length > 0;

  // Función para filtrar los miembros según los filtros aplicados
  const filteredMembers = useMemo(() => {
    if (!members || Object.keys(filters).length === 0) {
      return members;
    }

    return members.filter((member) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "fullName":
            const fullName = `${member.firstName} ${member.lastName}`;
            return filterValues.some((value) =>
              fullName.toLowerCase().includes(value.toLowerCase())
            );

          case "birthDate":
            const birthMonth = new Date(member.birthDate).getMonth() + 1;
            const birthMonthStr = birthMonth.toString().padStart(2, "0");
            return filterValues.includes(birthMonthStr);

          case "startDate":
            const startMonth = new Date(member.startDate).getMonth() + 1;
            const startMonthStr = startMonth.toString().padStart(2, "0");
            return filterValues.includes(startMonthStr);

          case "team":
            const teamName = member.team?.name || "";
            return filterValues.some((value) =>
              teamName.toLowerCase().includes(value.toLowerCase())
            );

          case "position":
            const position = member.position || "";
            return filterValues.some((value) =>
              position.toLowerCase().includes(value.toLowerCase())
            );

          case "products":
            const productCount = (member.products || []).length;
            return filterValues.some(
              (value) => productCount.toString() === value
            );

          default:
            return true;
        }
      });
    });
  }, [members, filters]);

  // Calcular datos paginados
  const paginatedMembers = useMemo(() => {
    if (!filteredMembers) return [];

    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredMembers.slice(startIndex, endIndex);
  }, [filteredMembers, pageIndex, pageSize]);

  // Calcular el número total de páginas
  const totalPages = useMemo(() => {
    if (!filteredMembers) return 1;
    return Math.ceil(filteredMembers.length / pageSize);
  }, [filteredMembers, pageSize]);

  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Name",
        meta: {
          hasFilter: true,
          filterOptions: Array.from(
            new Set(members?.map((m: Member) => `${m.firstName} ${m.lastName}`))
          ).map((name) => ({ label: name, value: name })),
        },
        cell: ({ getValue }) => (
          <span className="font-semibold text-blue-500">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "birthDate",
        header: "Date Of Birth",
        meta: {
          hasFilter: true,
          filterOptions: months,
        },
        cell: ({ getValue }) => (
          <span className="font-normal">
            <FormatedDate date={getValue<string>()} />{" "}
          </span>
        ),
      },
      {
        accessorKey: "startDate",
        header: "Joining Date",
        meta: {
          hasFilter: true,
          filterOptions: months,
        },
        cell: ({ getValue }) => {
          return (
            <span className="font-normal">
              <FormatedDate date={getValue<string>()} />
            </span>
          );
        },
      },
      {
        accessorKey: "team",
        header: "Team",
        meta: {
          hasFilter: true,
          filterOptions: Array.from(
            new Set(members?.map((m: Member) => m.team?.name))
          )
            .filter((name): name is string => name !== undefined)
            .map((name) => ({ label: name, value: name })),
        },
        cell: ({ row }) => {
          const team = row.original.team || null;

          return (
            <section className="flex justify-center">
              <TeamCard team={team} />
            </section>
          );
        },
      },
      {
        accessorKey: "position",
        header: "Job Position",
        meta: {
          hasFilter: true,
          filterOptions: Array.from(
            new Set(members?.map((m: Member) => m.position))
          )
            .filter((pos): pos is string => !!pos)
            .map((pos) => ({ label: pos, value: pos })),
        },
        cell: ({ getValue }) => (
          <span className="font-semibold">
            {getValue<string>() ? getValue<string>() : "-"}
          </span>
        ),
      },
      {
        accessorKey: "products",
        header: "Products",
        size: 120,
        meta: {
          hasFilter: true,
          filterOptions: Array.from(
            new Set(members?.map((m: Member) => m.products.length))
          )
            .filter((product): product is number => !!product)
            .map((product) => ({
              label: product.toString(),
              value: product.toString(),
            })),
        },
        cell: ({ row }) => (
          <span className="place-items-center grid bg-lightPurple/25 px-2 rounded-md w-6 h-6 font-semibold text-lg">
            {(row.original.products || []).length}
          </span>
        ),
      },
      {
        accessorKey: "",
        id: "actions",
        header: () => null,
        size: 120,
        cell: ({ row }) => <ActionsTableMembers member={row.original} />,
      },
    ],
    [members]
  );

  const handleClearAllFilters = () => {
    useMembersTableFilterStore.setState({ filters: {} });
  };

  return (
    <PageLayout>
      {isLoadingMembers && <BarLoader />}

      {hasMembers ? (
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

            <MyTeamActions />
          </div>

          <div className="flex-1 min-h-0">
            <DataTable
              columns={columns}
              data={paginatedMembers}
              useFilterStore={useMembersTableFilterStore}
              rowHeight={53.4}
              scrollContainerRef={tableContainerRef}
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
        <EmptyMembers />
      )}
    </PageLayout>
  );
}

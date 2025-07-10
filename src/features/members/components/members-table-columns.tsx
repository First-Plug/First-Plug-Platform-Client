"use client";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Member } from "@/features/members";
import { TeamCard } from "@/shared";
import { ActionsTableMembers } from "@/features/members";
import { FormatedDate } from "@/shared/components/Tables";
import { getFlagEmoji, months } from "@/features/members/utils/countryUtils";

interface UseMembersTableColumnsProps {
  members: Member[];
}

export const useMembersTableColumns = ({
  members,
}: UseMembersTableColumnsProps) => {
  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Name",
        meta: {
          hasFilter: true,
          filterOptions: Array.from(
            new Set(members?.map((m: Member) => `${m.firstName} ${m.lastName}`))
          )
            .map((name) => ({ label: name, value: name }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        },
        cell: ({ getValue }) => (
          <span className="font-semibold text-blue-500">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "country",
        header: "Country",
        meta: {
          hasFilter: true,
          filterOptions: Array.from(
            new Set(members?.map((m: Member) => m.country || ""))
          )
            .filter((name): name is string => !!name)
            .map((name) => ({ label: name, value: name }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        },
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xl">
              {getFlagEmoji(getValue<string>() || "")}
            </span>
            <span>{getValue<string>()}</span>
          </div>
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
            <FormatedDate date={getValue<string>()} />
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
            .map((name) => ({ label: name, value: name }))
            .sort((a, b) => a.label.localeCompare(b.label)),
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
            .map((pos) => ({ label: pos, value: pos }))
            .sort((a, b) => a.label.localeCompare(b.label)),
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
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        },
        cell: ({ row }) => (
          <div className="flex justify-center items-center w-full">
            <span className="flex justify-center items-center bg-lightPurple/25 px-2 rounded-md w-6 h-6 font-semibold text-lg">
              {(row.original.products || []).length}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "",
        id: "actions",
        header: "Actions",
        size: 120,
        cell: ({ row }) => <ActionsTableMembers member={row.original} />,
      },
    ],
    [members]
  );

  return columns;
};

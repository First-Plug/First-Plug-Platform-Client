"use client";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Member } from "@/features/members";
import { TeamCard, CountryFlag } from "@/shared";
import { ActionsTableMembers } from "@/features/members";
import { FormatedDate } from "@/shared/components/Tables";
import {
  getCountryDisplay,
  getCountryNameForFilter,
  months,
} from "@/features/members/utils/countryUtils";

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
          filterOptions: (() => {
            // Crear un mapeo de países normalizados
            const countryMapping = new Map<string, string[]>();

            members?.forEach((m: Member) => {
              if (m.country) {
                const normalizedName = getCountryNameForFilter(m.country);
                if (normalizedName) {
                  if (!countryMapping.has(normalizedName)) {
                    countryMapping.set(normalizedName, []);
                  }
                  countryMapping.get(normalizedName)!.push(m.country);
                }
              }
            });

            // Crear opciones de filtro con nombres normalizados
            const filterOptions = Array.from(countryMapping.entries())
              .map(([normalizedName, originalNames]) => ({
                label: normalizedName,
                value: originalNames.join("|"), // Usar pipe como separador para múltiples valores
              }))
              .sort((a, b) => a.label.localeCompare(b.label));

            return [...filterOptions, { label: "No Data", value: "no-data" }];
          })(),
        },
        cell: ({ getValue }) => {
          const country = getValue<string>();
          if (!country) {
            return <span>-</span>;
          }

          const countryDisplay = getCountryDisplay(country);
          if (!countryDisplay) {
            return <span>{country}</span>;
          }

          return (
            <div className="flex items-center gap-2">
              <CountryFlag countryName={country} size={15} />
              <span>{countryDisplay.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "birthDate",
        header: "Date Of Birth",
        meta: {
          hasFilter: true,
          filterOptions: [...months, { label: "No Data", value: "no-data" }],
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
          filterOptions: [...months, { label: "No Data", value: "no-data" }],
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
          filterOptions: [
            ...Array.from(new Set(members?.map((m: Member) => m.team?.name)))
              .filter((name): name is string => name !== undefined)
              .map((name) => ({ label: name, value: name }))
              .sort((a, b) => a.label.localeCompare(b.label)),
            { label: "Not Assigned", value: "not-assigned" },
          ],
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
          filterOptions: [
            ...Array.from(new Set(members?.map((m: Member) => m.position)))
              .filter((pos): pos is string => !!pos)
              .map((pos) => ({ label: pos, value: pos }))
              .sort((a, b) => a.label.localeCompare(b.label)),
            { label: "No Data", value: "no-data" },
          ],
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
          filterOptions: [
            ...Array.from(
              new Set(members?.map((m: Member) => m.products.length))
            )
              .filter((product): product is number => !!product)
              .map((product) => ({
                label: product.toString(),
                value: product.toString(),
              }))
              .sort((a, b) => a.label.localeCompare(b.label)),
            { label: "0", value: "0" },
          ],
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

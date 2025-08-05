"use client";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";

import { Member } from "@/features/members";
import { TeamCard, MiniCake, CountryFlag } from "@/shared";
import { DataTable, createFilterStore } from "@/features/fp-tables";

import { formatBirthDate, isBirthdayToday } from "@/features/dashboard";
import { getCountryDisplay } from "@/features/members/utils/countryUtils";

interface BirthdayTableProps {
  members: Member[];
}

export const BirthdayTable = ({ members }: BirthdayTableProps) => {
  const useFilterStore = createFilterStore();

  const birthdayColumns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        id: "fullName",
        accessorKey: "fullName",
        size: 150,
        header: "Full Name",
        cell: ({ getValue }) => (
          <span className="font-semibold text-blue-500">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: "country",
        accessorKey: "country",
        size: 140,
        header: "Country",
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
        id: "birthDate",
        accessorKey: "birthDate",
        size: 130,
        header: "Date of Birth",
        cell: ({ row, getValue }) => {
          const isToday = isBirthdayToday(row.original.birthDate);
          return (
            <span className="flex justify-between items-center gap-1 font-semibold text-blue-500">
              {formatBirthDate(getValue<string>())}
              {isToday && <MiniCake />}
            </span>
          );
        },
      },
      {
        id: "team",
        accessorKey: "team",
        size: 120,
        header: "Team",
        cell: ({ cell }) => {
          const team = cell.row.original.team || null;
          return (
            <section className="flex justify-start">
              <TeamCard team={team} />
            </section>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col w-full h-full">
      <DataTable
        columns={birthdayColumns}
        data={members}
        useFilterStore={useFilterStore}
        tableId="birthday-table"
        adaptiveHeight={false}
        enableSnapScroll={false}
        rowHeight={48}
      />
    </div>
  );
};

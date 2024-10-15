"use client";
import { ColumnDef } from "@tanstack/react-table";
import { BirthdayRoot } from "./BirthdayRoot";
import { TeamMember } from "@/types";
import { TeamCard } from "@/common";
import { MiniCake } from "@/common/Icons";

const formatBirthDate = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}`;
};
const isBirthdayToday = (birthDateString: string) => {
  const today = new Date();
  const [year, month, day] = birthDateString.split("-").map(Number);

  // Crear una fecha para el cumpleaños con el año actual
  const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);

  return (
    today.getDate() === birthdayThisYear.getDate() &&
    today.getMonth() === birthdayThisYear.getMonth()
  );
};

const birthdayColumns: ColumnDef<TeamMember>[] = [
  {
    id: "fullName",
    accessorKey: "fullName",
    size: 300,
    header: "Full Name",
    cell: ({ row, getValue }) => {
      const isToday = isBirthdayToday(row.original.birthDate);
      return (
        <span className="font-semibold text-blue-500 flex items-center gap-2 justify-between">
          {getValue<string>()}
          {isToday && <MiniCake />}
        </span>
      );
    },
  },
  {
    id: "birthDate",
    accessorKey: "birthDate",
    size: 100,
    header: "Date of Birth",

    // sortingFn: (rowA, rowB) => {
    //   const daysA = daysUntilNextBirthday(rowA.original.birthDate);
    //   const daysB = daysUntilNextBirthday(rowB.original.birthDate);
    //   return daysA - daysB;
    // },
    cell: ({ getValue }) => <span>{formatBirthDate(getValue<string>())}</span>,
  },
  {
    id: "team",
    accessorKey: "team",
    size: 100,
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
];

interface BirthdayTableProps {
  members: TeamMember[];
}

export const BirthdayTable = ({ members }: BirthdayTableProps) => {
  return <BirthdayRoot columns={birthdayColumns} data={members} />;
};

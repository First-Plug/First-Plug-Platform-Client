"use client";
import { ColumnDef } from "@tanstack/react-table";
import { BirthdayRoot } from "./BirthdayRoot";
import { TeamMember } from "@/types";
import { TeamCard } from "@/common";
import { MiniCake } from "@/common";

const formatBirthDate = (dateString) => {
  const cleanDate = dateString.includes("T")
    ? dateString.split("T")[0]
    : dateString;
  const [year, month, day] = cleanDate.split("-");
  return `${day}/${month}`;
};
const isBirthdayToday = (birthDateString: string) => {
  const today = new Date();
  const [year, month, day] = birthDateString.split("-").map(Number);

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
    cell: ({ getValue }) => <span>{formatBirthDate(getValue<string>())}</span>,
  },
  {
    id: "team",
    accessorKey: "team",
    size: 100,
    header: "Team",
    cell: ({ cell }) => {
      const team = cell.row.original.team;
      if (!team) {
        return null;
      }
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

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
  today.setHours(0, 0, 0, 0);
  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const cleanDate = birthDateString.includes("T")
    ? birthDateString.split("T")[0]
    : birthDateString;

  if (!cleanDate || typeof cleanDate !== "string" || !cleanDate.includes("-")) {
    console.error(`Invalid birth date format: ${cleanDate}`);
    return false;
  }
  const [year, month, day] = cleanDate.split("-").map(Number);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.error(`Failed to parse birth date: ${cleanDate}`);
    return false;
  }
  const birthdayUTC = Date.UTC(today.getFullYear(), month - 1, day);

  return todayUTC === birthdayUTC;
};

const birthdayColumns: ColumnDef<TeamMember>[] = [
  {
    id: "fullName",
    accessorKey: "fullName",
    size: 300,
    header: "Full Name",
    cell: ({ getValue }) => (
      <span className="font-semibold text-blue-500">{getValue<string>()}</span>
    ),
  },
  {
    id: "birthDate",
    accessorKey: "birthDate",
    size: 100,
    header: "Date of Birth",
    cell: ({ row, getValue }) => {
      const isToday = isBirthdayToday(row.original.birthDate);
      return (
        <span className="font-semibold text-blue-500 flex items-center gap-1 justify-between">
          {formatBirthDate(getValue<string>())}
          {isToday && <MiniCake />}
        </span>
      );
    },
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

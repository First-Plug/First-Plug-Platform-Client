"use client";
import { ColumnDef } from "@tanstack/react-table";
import { BirthdayRoot } from "./BirthdayRoot";
import { TeamMember } from "@/types";

const formatBirthDate = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}`;
};

const birthdayColumns: ColumnDef<TeamMember>[] = [
  {
    id: "fullName",
    accessorKey: "fullName",
    size: 200,
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
    cell: ({ getValue }) => <span>{formatBirthDate(getValue<string>())}</span>,
  },
];

interface BirthdayTableProps {
  members: TeamMember[];
}

export const BirthdayTable = ({ members }: BirthdayTableProps) => {
  return <BirthdayRoot columns={birthdayColumns} data={members} />;
};
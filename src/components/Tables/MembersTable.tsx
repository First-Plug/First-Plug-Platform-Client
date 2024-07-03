import { useStore } from "@/models";
import { Memberservices } from "@/services";
import { Team, TeamMember } from "@/types";
import { Button, ElipsisVertical, PenIcon, TeamCard } from "@/common";
import { ColumnDef } from "@tanstack/react-table";
import { DeleteAction } from "../Alerts";
import { RootTable } from "./RootTable";
import FormatedDate from "./helpers/FormatedDate";

const membersColumns: (
  handleEdit: (memberId: TeamMember["_id"]) => void,
  handleDelete: (memberId: TeamMember["_id"]) => void,
  handleViewDetail: (memberId: TeamMember["_id"]) => void
) => ColumnDef<TeamMember>[] = (handleEdit, handleDelete, handleViewDetail) => [
  {
    id: "name",
    accessorKey: "fullName",
    size: 150,
    header: "Name",
    cell: ({ getValue }) => (
      <span className="font-semibold   text-blue-500">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "birthDate",
    header: "Date Of Birth",
    size: 100,
    cell: ({ getValue }) => (
      <span className="font-normal">
        {" "}
        <FormatedDate date={getValue<string>()} />{" "}
      </span>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Joining Date",
    size: 100,
    cell: ({ getValue }) => (
      <span className="font-normal">
        <FormatedDate date={getValue<string>()} />
      </span>
    ),
  },
  {
    accessorKey: "team",
    header: "Team",
    size: 150,
    cell: ({ getValue }) => {
      const team = getValue<Team>();
      console.log("Team object:", team);
      if (!team) {
        return null;
      }
      return (
        <section className="flex justify-center">
          <TeamCard team={team} />
        </section>
      );
    },
    meta: {
      filterVariant: "select",
    },
  },
  {
    accessorKey: "position",
    header: "Job Position",
    size: 100,
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
    size: 60,
    cell: ({ row }) => (
      <span className="font-semibold text-lg bg-lightPurple/25 rounded-md  h-6 w-6 px-2 grid place-items-center">
        {(row.original.products || []).length}
      </span>
    ),
  },
  {
    accessorKey: "",
    id: "actions",
    size: 80,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Button
          variant="text"
          onClick={() => handleEdit(row.original._id)}
          icon={
            <PenIcon
              strokeWidth={2}
              className="text-dark-grey w-[1.2rem] h-[1.2rem]"
            />
          }
        />
        <DeleteAction type="member" id={row.original._id} />
        <Button
          variant="text"
          onClick={() => handleViewDetail(row.original._id)}
          icon={
            <ElipsisVertical
              strokeWidth={2}
              className="text-dark-grey w-[1.2rem] h-[1.2rem]"
            />
          }
        />
      </div>
    ),
  },
];
interface TableMembersProps {
  members: TeamMember[];
}
export function MembersTable({ members }: TableMembersProps) {
  const {
    members: { setSelectedMember, setMembers, setMemberToEdit },
    aside: { setAside },
  } = useStore();

  const handleEdit = (memberId: TeamMember["_id"]) => {
    setMemberToEdit(memberId);
    setAside("EditMember");
  };
  const handleDelete = async (memberId: TeamMember["_id"]) => {
    try {
      await Memberservices.deleteMember(memberId);
      const res = await Memberservices.getAllMembers();
      setMembers(res);
      alert("Member has been deleted!");
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };
  const handleViewDetail = (memberId: TeamMember["_id"]) => {
    setSelectedMember(memberId);
    setAside("MemberDetails");
  };

  return (
    <RootTable
      tableType="members"
      columns={membersColumns(handleEdit, handleDelete, handleViewDetail)}
      data={members}
      pageSize={12}
    />
  );
}

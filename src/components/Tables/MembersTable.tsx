import { useStore } from "@/models";
import { Memberservices } from "@/services";
import { Team, TeamMember } from "@/types";
import { Button, ElipsisVertical, PenIcon, TeamCard } from "@/common";
import { ColumnDef } from "@tanstack/react-table";
import { DeleteAction } from "../Alerts";
import { RootTable } from "./RootTable";
import FormatedDate from "./helpers/FormatedDate";
import { useFetchMembers } from "@/members/hooks";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const membersColumns: (
  handleEdit: (memberId: TeamMember["_id"]) => void,
  handleDelete: (memberId: TeamMember["_id"]) => void,
  handleViewDetail: (memberId: TeamMember["_id"]) => void,
  members: TeamMember[],
  filteredMembers?: TeamMember[]
) => ColumnDef<TeamMember>[] = (
  handleEdit,
  handleDelete,
  handleViewDetail,
  members,
  filteredMembers = members
) => [
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
    meta: {
      filterVariant: "custom",
      options: () => {
        const options = new Set<string>();
        filteredMembers.forEach((member) => {
          options.add(member.fullName || "No Data");
        });
        return Array.from(options).sort();
      },
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      return filterValue.includes(row.getValue(columnId) || "No Data");
    },
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
    meta: {
      filterVariant: "select",
      options: () => {
        const options = new Set<string>();
        filteredMembers.forEach((member) => {
          const dateValue = member.birthDate;
          if (dateValue) {
            const month = new Date(dateValue).toLocaleString("en-US", {
              month: "long",
            });
            options.add(month);
          } else {
            options.add("No Data");
          }
        });
        const finalOptions = Array.from(options)
          .sort((a, b) => MONTHS.indexOf(a) - MONTHS.indexOf(b))
          .concat("No Data");

        return finalOptions;
      },
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      const dateValue = row.getValue(columnId) as string | undefined;
      const month = dateValue
        ? new Date(dateValue).toLocaleString("en-US", { month: "long" })
        : "No Data";
      return filterValue.includes(month);
    },
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
    meta: {
      filterVariant: "select",
      options: () => {
        const options = new Set<string>();
        filteredMembers.forEach((member) => {
          const dateValue = member.startDate;
          const month = dateValue
            ? new Date(dateValue).toLocaleString("en-US", { month: "long" })
            : "No Data";
          options.add(month);
        });
        return Array.from(options)
          .sort((a, b) => MONTHS.indexOf(a) - MONTHS.indexOf(b))
          .concat("No Data");
      },
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      const dateValue = row.getValue(columnId) as string | undefined;
      const month = dateValue
        ? new Date(dateValue).toLocaleString("en-US", { month: "long" })
        : "No Data";
      return filterValue.includes(month);
    },
  },
  {
    accessorKey: "teamId",
    header: "Team",
    size: 150,
    cell: ({ cell }) => {
      const team = cell.row.original.team;
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
      options: () => {
        const options = new Set<string>();
        filteredMembers.forEach((member) => {
          if (typeof member.team === "object" && member.team !== null) {
            // Añadir un console.log para depurar el valor del equipo
            console.log("Team object:", member.team);
            const teamName = member.team?.name || "Not Assigned";
            options.add(teamName);
          } else {
            options.add("Not Assigned");
          }
        });
        return Array.from(options).sort().concat("Not Assigned");
      },
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      const teamName = (row.original.team as Team)?.name || "Not Assigned";
      return filterValue.includes(teamName);
    },
  },
  {
    accessorKey: "position",
    header: "Job Position",
    size: 100,
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue<string>()}</span>
    ),
    meta: {
      filterVariant: "custom",
      options: () => {
        const options = new Set<string>();
        filteredMembers.forEach((member) => {
          options.add(member.position || "No Data");
        });
        return Array.from(options).sort().concat("No Data");
      },
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      return filterValue.includes(row.getValue(columnId) || "No Data");
    },
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
    meta: {
      filterVariant: "select",
      options: () => {
        const productCounts = new Set<number>();
        filteredMembers.forEach((member) => {
          const count = (member.products || []).length;
          productCounts.add(count);
        });
        return Array.from(productCounts)
          .sort((a, b) => a - b)
          .map(String);
      },
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      const productCount = (row.original.products || []).length.toString();
      return filterValue.includes(productCount);
    },
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
export function MembersTable({ members: propMembers }: TableMembersProps) {
  const {
    members: { setSelectedMember, setMembers, setMemberToEdit },
    aside: { setAside },
  } = useStore();

  const { data: fetchedMembers = [], isLoading, isError } = useFetchMembers();

  const handleEdit = (memberId: TeamMember["_id"]) => {
    setMemberToEdit(memberId);
    setAside("EditMember");
  };
  const handleDelete = async (memberId: TeamMember["_id"]) => {
    try {
      await Memberservices.deleteMember(memberId); // eventualmente MUTACION
      const res = await Memberservices.getAllMembers();
      setMembers(res);
      alert("Member has been deleted!");
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };
  const handleViewDetail = (memberId: TeamMember["_id"]) => {
    setMemberToEdit(memberId);
    setAside("MemberDetails");
  };

  const membersToRender = propMembers.length > 0 ? propMembers : fetchedMembers;

  return (
    <RootTable
      tableType="members"
      columns={membersColumns(
        handleEdit,
        handleDelete,
        handleViewDetail,
        membersToRender
      )}
      data={membersToRender}
      pageSize={12}
      tableNameRef="membersTable"
    />
  );
}

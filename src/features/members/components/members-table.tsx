"use client";
import { useStore } from "@/models";
import { Team } from "@/types";
import { Button, ElipsisVertical, PenIcon, TeamCard } from "@/common";
import { ColumnDef } from "@tanstack/react-table";
import { DeleteAction } from "@/components/Alerts";
import { RootTable } from "@/components/Tables/RootTable";
import FormatedDate from "@/components/Tables/helpers/FormatedDate";
import {
  useDeleteMember,
  useFetchMembers,
  usePrefetchMember,
} from "@/features/members";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { Member } from "@/features/members";

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
  handleEdit: (memberId: Member["_id"]) => void,
  handleDelete: (memberId: Member["_id"]) => void,
  handleViewDetail: (memberId: Member["_id"]) => void,
  prefetchMember: (id: string) => void,
  members: Member[],
  filteredMembers?: Member[]
) => ColumnDef<Member>[] = (
  handleEdit,
  handleDelete,
  handleViewDetail,
  prefetchMember,
  members,
  filteredMembers = members
) => [
  {
    id: "name",
    accessorKey: "fullName",
    size: 150,
    header: "Name",
    cell: ({ getValue }) => (
      <span className="font-semibold text-blue-500">{getValue<string>()}</span>
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
      const team = cell.row.original.team || null;

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
      <span className="place-items-center grid bg-lightPurple/25 px-2 rounded-md w-6 h-6 font-semibold text-lg">
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
    cell: ({ row }) => {
      const member = row.original;
      const isEditDisabled = (member as any).hasOnTheWayShipment === true;
      const isDeleteDisabled = member.activeShipment === true;

      return (
        <div className="flex justify-end items-center gap-1">
          <div
            onMouseEnter={() => {
              prefetchMember(member._id);
            }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="text"
                      onMouseEnter={() => {
                        prefetchMember(member._id);
                      }}
                      onClick={() => handleEdit(member._id)}
                      disabled={isEditDisabled}
                      icon={
                        <PenIcon
                          strokeWidth={2}
                          className={`w-[1.2rem] h-[1.2rem] ${
                            isEditDisabled ? "text-disabled" : "text-dark-grey"
                          }`}
                        />
                      }
                    />
                  </div>
                </TooltipTrigger>
                {isEditDisabled && (
                  <TooltipContent
                    side="bottom"
                    align="end"
                    className="z-50 bg-blue/80 p-2 rounded-md font-normal text-white text-xs"
                  >
                    Members involved in a shipment that&apos;s &quot;On the
                    way&quot; cannot be edited.
                    <TooltipArrow className="fill-blue/80" />
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DeleteAction
                    type="member"
                    id={member._id}
                    disabled={isDeleteDisabled}
                  />
                </div>
              </TooltipTrigger>
              {isDeleteDisabled && (
                <TooltipContent
                  side="bottom"
                  align="end"
                  className="z-50 bg-blue/80 p-2 rounded-md font-normal text-white text-xs"
                >
                  Members with active shipments cannot be deleted.
                  <TooltipArrow className="fill-blue/80" />
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <div
            onMouseEnter={() => {
              prefetchMember(member._id);
            }}
          >
            <Button
              variant="text"
              onClick={() => handleViewDetail(member._id)}
              icon={
                <ElipsisVertical
                  strokeWidth={2}
                  className="w-[1.2rem] h-[1.2rem] text-dark-grey"
                />
              }
            />
          </div>
        </div>
      );
    },
  },
];
interface TableMembersProps {
  members: Member[];
}
export const MembersTable = ({ members: propMembers }: TableMembersProps) => {
  const prefetchMember = usePrefetchMember();
  const { data: fetchedMembers = [], isLoading, isError } = useFetchMembers();
  const deleteMemberMutation = useDeleteMember();

  const {
    members: { setMemberToEdit, setSelectedMember },
    aside: { setAside },
  } = useStore();

  const handleEdit = (memberId: Member["_id"]) => {
    setMemberToEdit(memberId);
    setAside("EditMember");
  };

  const handleDelete = async (memberId: Member["_id"]) => {
    await deleteMemberMutation.mutateAsync(memberId, {
      onSuccess: () => {
        alert("Member has been deleted!");
      },
      onError: (error) => {
        console.error("Failed to delete member:", error);
      },
    });
  };

  const handleViewDetail = (memberId: Member["_id"]) => {
    setMemberToEdit(memberId);
    setSelectedMember(memberId);
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
        prefetchMember,
        membersToRender
      )}
      data={membersToRender}
      pageSize={12}
      tableNameRef="membersTable"
    />
  );
};

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TeamMember } from "@/types";

interface TeamsTableProps {
  data: {
    oldData: TeamMember[];
    newData: TeamMember[];
  };
}

const ActionTeamsTable: React.FC<TeamsTableProps> = ({ data }) => {
  const oldData: TeamMember[] = Array.isArray(data.oldData)
    ? data.oldData
    : [data.oldData];
  const newData: TeamMember[] = Array.isArray(data.newData)
    ? data.newData
    : [data.newData];

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-200 bg-light-grey rounded-md">
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Name
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Assigned email
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Old Team
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            New Team
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {oldData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No teams found.
            </TableCell>
          </TableRow>
        ) : (
          oldData.map((member, index) => (
            <TableRow key={index}>
              <TableCell className="text-xs py-2 px-4 border-r">
                {member.firstName + " " + member.lastName}
              </TableCell>
              <TableCell className="text-xs py-2 px-4 border-r">
                {member.email}
              </TableCell>
              <TableCell className="text-xs py-2 px-4 border-r">
                {typeof member.team === "object" && member.team !== null
                  ? member.team.name
                  : "-"}
              </TableCell>

              <TableCell className="text-xs py-2 px-4 border-r">
                {typeof newData[index].team === "object" &&
                newData[index].team?.name
                  ? newData[index].team.name
                  : "-"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ActionTeamsTable;

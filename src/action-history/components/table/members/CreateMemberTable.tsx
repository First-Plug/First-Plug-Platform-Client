import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TeamMember } from "@/types";

interface MembersTableProps {
  data: TeamMember | TeamMember[];
}

const CreateMembersTable: React.FC<MembersTableProps> = ({ data }) => {
  const normalizedData: TeamMember[] = Array.isArray(data) ? data : [data];

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
            Team
          </TableHead>
          <TableHead className="py-3 px-4 text-start text-black font-semibold">
            Country
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {normalizedData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No members found.
            </TableCell>
          </TableRow>
        ) : (
          normalizedData.map((member, index) => (
            <TableRow key={index}>
              <TableCell className="text-xs py-2 px-4 border-r">
                {member.firstName + " " + member.lastName}
              </TableCell>
              <TableCell className="text-xs py-2 px-4 border-r">
                {member.email}
              </TableCell>
              <TableCell className="text-xs py-2 px-4 border-r">
                {(member.team as string) || "-"}
              </TableCell>
              <TableCell className="text-xs py-2 px-4">
                {member.country || "-"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CreateMembersTable;

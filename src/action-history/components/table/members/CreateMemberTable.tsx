import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Member } from "@/features/members";

interface MembersTableProps {
  data: Member | Member[];
}

const CreateMembersTable: React.FC<MembersTableProps> = ({ data }) => {
  const normalizedData: Member[] = Array.isArray(data) ? data : [data];

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Name
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Assigned email
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Team
          </TableHead>
          <TableHead className="px-4 py-3 font-semibold text-black text-start">
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
              <TableCell className="px-4 py-2 border-r text-xs">
                {member.firstName + " " + member.lastName}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {member.email}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {typeof member.team === "object" && member.team !== null
                  ? (member.team.name as string)
                  : "-"}
              </TableCell>
              <TableCell className="px-4 py-2 text-xs">
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

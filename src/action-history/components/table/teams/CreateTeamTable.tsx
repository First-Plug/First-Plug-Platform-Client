import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Team } from "@/types";

interface TeamsTableProps {
  data: Team | Team[];
}

const CreateTeamsTable: React.FC<TeamsTableProps> = ({ data }) => {
  const normalizedData: Team[] = Array.isArray(data) ? data : [data];

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-200 bg-light-grey rounded-md">
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Team name
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
          normalizedData.map((team, index) => (
            <TableRow key={index}>
              <TableCell className="text-xs py-2 px-4 border-r">
                {team.name}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CreateTeamsTable;

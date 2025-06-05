import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";
import { Team } from "@/types";

interface TeamsTableProps {
  data: {
    oldData: Team;
    newData: Team;
  };
}

const UpdateTeamsTable: React.FC<TeamsTableProps> = ({ data }) => {
  const oldData: Team[] = Array.isArray(data.oldData)
    ? data.oldData
    : [data.oldData];
  const newData: Team[] = Array.isArray(data.newData)
    ? data.newData
    : [data.newData];

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Team name
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Old name
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            New name
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
          oldData.map((team, index) => (
            <TableRow key={index}>
              <TableCell className="px-4 py-2 border-r text-xs">
                {team?.name}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {team?.name}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {newData[index]?.name}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UpdateTeamsTable;

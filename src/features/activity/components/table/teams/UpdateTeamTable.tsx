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
        <TableRow className="border-gray-200 bg-light-grey rounded-md">
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Team name
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Old name
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
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
              <TableCell className="text-xs py-2 px-4 border-r">
                {team?.name}
              </TableCell>
              <TableCell className="text-xs py-2 px-4 border-r">
                {team?.name}
              </TableCell>
              <TableCell className="text-xs py-2 px-4 border-r">
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

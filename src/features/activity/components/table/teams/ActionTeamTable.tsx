import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";

// Modifica la interfaz de Member para reflejar la posible estructura de `team`
interface Team {
  name: string;
}

interface Member {
  firstName: string;
  lastName: string;
  email: string;
  team: Team | string; // Aquí puede ser un objeto o un string
}

interface TeamsTableProps {
  data: {
    oldData: Member[];
    newData: Member[];
  };
}

const ActionTeamsTable: React.FC<TeamsTableProps> = ({ data }) => {
  const oldData: Member[] = Array.isArray(data.oldData)
    ? data.oldData
    : [data.oldData];
  const newData: Member[] = Array.isArray(data.newData)
    ? data.newData
    : [data.newData];

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
            Old Team
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
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
              <TableCell className="px-4 py-2 border-r text-xs">
                {member.firstName + " " + member.lastName}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {member.email}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {typeof member.team === "object" && member.team !== null
                  ? member.team.name
                  : "-"}
              </TableCell>

              <TableCell className="px-4 py-2 border-r text-xs">
                {typeof newData[index].team === "object" &&
                newData[index].team !== null
                  ? (newData[index].team as Team).name
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

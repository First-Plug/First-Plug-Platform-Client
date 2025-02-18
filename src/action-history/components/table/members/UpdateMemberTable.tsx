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
  data: {
    oldData: TeamMember;
    newData: TeamMember;
  };
}

const getUpdatedFields = (oldData: TeamMember, newData: TeamMember) => {
  const changes: { field: string; oldValue: any; newValue: any }[] = [];

  Object.keys(newData).forEach((key) => {
    if (
      ["updatedAt", "createdAt", "acquisitionDate", "deletedAt"].includes(key)
    ) {
      return; // Ignorar estos campos
    }

    if (
      key !== "products" &&
      newData[key as keyof TeamMember] !== oldData[key as keyof TeamMember]
    ) {
      let oldValue = oldData[key as keyof TeamMember] || "-";
      let newValue = newData[key as keyof TeamMember] || "-";

      changes.push({ field: key, oldValue, newValue });
    }
  });

  return changes;
};

const UpdateMembersTable: React.FC<MembersTableProps> = ({ data }) => {
  const updatedFields = getUpdatedFields(data.oldData, data.newData);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-200 bg-light-grey rounded-md">
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Original name
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Original Assigned email
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Updated Field
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Old data
          </TableHead>
          <TableHead className="py-3 px-4 text-start text-black font-semibold">
            New data
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {updatedFields.map((change, index) => (
          <TableRow key={index}>
            <TableCell className="text-xs py-2 px-4 border-r">
              {data.oldData.firstName + " " + data.oldData.lastName}
            </TableCell>
            <TableCell className="text-xs py-2 px-4 border-r">
              {data.oldData.email}
            </TableCell>
            <TableCell className="text-xs py-2 px-4 border-r">
              {change.field}
            </TableCell>
            <TableCell className="text-xs py-2 px-4 border-r">
              {change.oldValue}
            </TableCell>
            <TableCell className="text-xs py-2 px-4">
              {change.newValue}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UpdateMembersTable;

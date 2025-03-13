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
    oldData: TeamMember[];
    newData: TeamMember[];
  };
}

const OffboardingMembersTable: React.FC<MembersTableProps> = ({ data }) => {
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
            Brand + Model + Name
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Recoverable
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Serial
          </TableHead>
          <TableHead className="py-3 px-4 text-start text-black font-semibold">
            New Location
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {oldData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No members found.
            </TableCell>
          </TableRow>
        ) : (
          oldData.map((member, memberIndex) =>
            member.products.map((product, productIndex) => (
              <TableRow key={`${memberIndex}-${productIndex}`}>
                <TableCell className="text-xs py-2 px-4 border-r">
                  {member.firstName + " " + member.lastName}
                </TableCell>
                <TableCell className="text-xs py-2 px-4 border-r">
                  {member.email}
                </TableCell>
                <TableCell className="text-xs py-2 px-4 border-r">
                  {[
                    product.attributes?.find((attr) => attr.key === "brand")
                      ?.value,
                    product.attributes?.find((attr) => attr.key === "model")
                      ?.value,
                    product.name,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </TableCell>
                <TableCell className="text-xs py-2 px-4 border-r">
                  {product.recoverable ? "Yes" : "No"}
                </TableCell>
                <TableCell className="text-xs py-2 px-4 border-r">
                  {product.serialNumber || "-"}
                </TableCell>
                <TableCell className="text-xs py-2 px-4 border-r">
                  {newData[memberIndex]?.products[productIndex]?.location ||
                    "-"}
                </TableCell>
              </TableRow>
            ))
          )
        )}
      </TableBody>
    </Table>
  );
};

export default OffboardingMembersTable;

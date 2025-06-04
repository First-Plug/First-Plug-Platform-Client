import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Member } from "@/features/members";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MembersTableProps {
  data: {
    oldData: Member[];
    newData: Member[];
  };
}

const OffboardingMembersTable: React.FC<MembersTableProps> = ({ data }) => {
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
            Brand + Model + Name
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Recoverable
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Serial
          </TableHead>
          <TableHead className="px-4 py-3 font-semibold text-black text-start">
            New Location
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {oldData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              No members found.
            </TableCell>
          </TableRow>
        ) : (
          oldData.map((member, memberIndex) =>
            member.products.map((product, productIndex) => {
              const newProduct = newData[memberIndex]?.products.find(
                (p) => (p as any).productId === product._id
              );

              const newLocation = (newProduct as any)?.newLocation || "-";

              const locationToShow =
                newLocation === "New employee" ? (
                  newProduct?.assignedMember ? (
                    newProduct?.assignedMember
                  ) : (
                    <TooltipProvider>
                      <Tooltip delayDuration={350}>
                        <TooltipTrigger>
                          <span className="bg-hoverRed p-1 px-3 rounded-md text-black text-sm cursor-pointer">
                            {newProduct?.assignedEmail} ⚠️
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white">
                          <p className="font-semibold">
                            ❌ This email is not registered as part of your team
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                ) : (
                  newLocation
                );

              return (
                <TableRow key={`${memberIndex}-${productIndex}`}>
                  <TableCell className="px-4 py-2 border-r text-xs">
                    {member.firstName + " " + member.lastName}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r text-xs">
                    {member.email}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r text-xs">
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
                  <TableCell className="px-4 py-2 border-r text-xs">
                    {product.recoverable ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r text-xs">
                    {product.serialNumber || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r text-xs">
                    {locationToShow}
                  </TableCell>
                </TableRow>
              );
            })
          )
        )}
      </TableBody>
    </Table>
  );
};

export default OffboardingMembersTable;

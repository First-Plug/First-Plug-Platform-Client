import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  CountryFlag,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/shared";
import { Member } from "@/features/members";
import { countriesByCode } from "@/shared/constants/country-codes";

interface MembersTableProps {
  data: Member | Member[];
}

const DeleteMembersTable: React.FC<MembersTableProps> = ({ data }) => {
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
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Country
          </TableHead>
          <TableHead className="px-4 py-3 font-semibold text-black text-start">
            Non recoverable products
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
              <TableCell className="px-4 py-2 border-r text-xs">
                {member.country ? (
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <span>
                            <CountryFlag
                              countryName={member.country}
                              size={15}
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-blue/80 text-white text-xs">
                          {countriesByCode[member.country] || member.country}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span>
                      {countriesByCode[member.country] || member.country}
                    </span>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="flex flex-col px-4 py-2 text-xs">
                {member.products.length > 0
                  ? member.products.map((product) => (
                      <span key={product._id}>
                        {[
                          product.attributes?.find(
                            (attr) => attr.key === "brand"
                          )?.value,
                          product.attributes?.find(
                            (attr) => attr.key === "model"
                          )?.value,
                          product.name,
                        ]
                          .filter(Boolean)
                          .join(" ")}{" "}
                        <br />
                      </span>
                    ))
                  : "-"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default DeleteMembersTable;

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
import {
  normalizeCountryCode,
  getCountryName,
} from "@/shared/utils/countryCodeNormalizer";

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
                {member.country
                  ? (() => {
                      const countryCode = normalizeCountryCode(member.country);
                      const countryName = getCountryName(member.country);
                      return countryCode ? (
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <span>
                                  <CountryFlag
                                    countryName={countryCode}
                                    size={15}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-blue/80 text-white text-xs">
                                {countryName}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span>{countryName}</span>
                        </div>
                      ) : (
                        <span>{member.country}</span>
                      );
                    })()
                  : "-"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CreateMembersTable;

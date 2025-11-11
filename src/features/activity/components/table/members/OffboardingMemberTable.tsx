import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  CountryFlag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { Member } from "@/features/members";
import { countriesByCode } from "@/shared/constants/country-codes";

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

              const locationToShow = (() => {
                // Check for different variations of "New employee"
                const isNewEmployee =
                  newLocation === "New employee" ||
                  newLocation === "new employee" ||
                  newLocation === "Employee" ||
                  newLocation === "employee";

                if (isNewEmployee) {
                  const assignedMember = (newProduct as any)?.assignedMember;
                  const assignedEmail = (newProduct as any)?.assignedEmail;
                  const country =
                    (newProduct as any)?.country ||
                    (newProduct as any)?.countryCode;

                  if (assignedMember && typeof assignedMember === "string") {
                    return (
                      <div className="flex items-center gap-2">
                        {country && (
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <span>
                                  <CountryFlag
                                    countryName={country}
                                    size={15}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-blue/80 text-white text-xs">
                                {countriesByCode[country] || country}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <span>{assignedMember}</span>
                      </div>
                    );
                  }

                  if (assignedEmail) {
                    const assignedMemberData = newData.find(
                      (member) => member.email === assignedEmail
                    );

                    if (assignedMemberData) {
                      const memberCountry = assignedMemberData.country;
                      return (
                        <div className="flex items-center gap-2">
                          {memberCountry && (
                            <TooltipProvider>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <span>
                                    <CountryFlag
                                      countryName={memberCountry}
                                      size={15}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-blue/80 text-white text-xs">
                                  {countriesByCode[memberCountry] ||
                                    memberCountry}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <span>{`${assignedMemberData.firstName} ${assignedMemberData.lastName}`}</span>
                        </div>
                      );
                    }

                    return (
                      <TooltipProvider>
                        <Tooltip delayDuration={350}>
                          <TooltipTrigger>
                            <span className="bg-hoverRed p-1 px-3 rounded-md text-black text-sm cursor-pointer">
                              {assignedEmail} ⚠️
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white">
                            <p className="font-semibold">
                              ❌ This email is not registered as part of your
                              team
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }

                  return "New employee";
                }

                // Handle FP warehouse
                if (newLocation === "FP warehouse") {
                  const country =
                    (newProduct as any)?.country ||
                    (newProduct as any)?.countryCode;
                  return (
                    <div className="flex items-center gap-2">
                      {country && (
                        <TooltipProvider>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <span>
                                <CountryFlag countryName={country} size={15} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-blue/80 text-white text-xs">
                              {countriesByCode[country] || country}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <span>FP warehouse</span>
                    </div>
                  );
                }

                // Handle Our office
                if (newLocation === "Our office") {
                  const office = (newProduct as any)?.office;
                  const officeName =
                    office?.officeName ||
                    (newProduct as any)?.officeName ||
                    "Our office";
                  const country =
                    office?.officeCountryCode ||
                    (newProduct as any)?.country ||
                    (newProduct as any)?.countryCode;

                  return (
                    <div className="flex items-center gap-2">
                      {country && (
                        <TooltipProvider>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <span>
                                <CountryFlag countryName={country} size={15} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-blue/80 text-white text-xs">
                              {countriesByCode[country] || country}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <span>{officeName}</span>
                    </div>
                  );
                }

                return newLocation;
              })();

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
                  <TableCell className="px-4 py-2 text-xs">
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

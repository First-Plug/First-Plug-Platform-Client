import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  CountryFlag,
} from "@/shared";

import { Office } from "@/features/settings";
import { countriesByCode } from "@/shared/constants/country-codes";
import { normalizeCountryCode } from "@/shared/utils/countryCodeNormalizer";

interface OfficesTableProps {
  data: Office | Office[];
}

const CreateOfficesTable: React.FC<OfficesTableProps> = ({ data }) => {
  const normalizedData: Office[] = Array.isArray(data) ? data : [data];

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r w-1/2 font-semibold text-black text-start">
            Name
          </TableHead>
          <TableHead className="px-4 py-3 w-1/2 font-semibold text-black text-start">
            Country
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {normalizedData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={2} className="h-24 text-center">
              No offices found.
            </TableCell>
          </TableRow>
        ) : (
          normalizedData.map((office, index) => (
            <TableRow key={index}>
              <TableCell className="px-4 py-2 border-r text-xs">
                {office.name}
              </TableCell>
              <TableCell className="px-4 py-2 text-xs">
                {office.country
                  ? (() => {
                      const countryCode = normalizeCountryCode(office.country);
                      return countryCode ? (
                        <div className="flex items-center gap-2">
                          <CountryFlag countryName={countryCode} size={15} />
                          <span>
                            {countriesByCode[countryCode] || office.country}
                          </span>
                        </div>
                      ) : (
                        <span>{office.country}</span>
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

export default CreateOfficesTable;

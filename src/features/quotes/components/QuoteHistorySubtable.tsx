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
import type {
  QuoteHistoryProduct,
  QuoteHistoryService,
  EnrolledDeviceSnapshot,
  ITSupportProductSnapshot,
} from "../types/quote.types";
import { countriesByCode } from "@/shared/constants/country-codes";
import { normalizeCountryCode } from "@/shared/utils/countryCodeNormalizer";

interface QuoteHistorySubtableProps {
  products?: QuoteHistoryProduct[];
  services?: QuoteHistoryService[];
}

type TableRow =
  | { type: "product"; data: QuoteHistoryProduct }
  | {
      type: "service";
      serviceCategory: string;
      data: EnrolledDeviceSnapshot;
      index: number;
      total: number;
    }
  | {
      type: "service";
      serviceCategory: "IT Support";
      data: ITSupportProductSnapshot;
      issues?: string[];
      description?: string;
      impactLevel?: string;
      issueStartDate?: string;
    };

const formatDate = (date?: string) => {
  if (!date) return "N/A";

  const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return "Invalid date";

  const [, year, month, day] = dateMatch;
  return `${day}/${month}/${year}`;
};

const QuoteLocationWithCountry = ({ country }: { country?: string }) => {
  if (!country) {
    return <span>N/A</span>;
  }

  const normalizedCountry = normalizeCountryCode(country);
  const countryName = normalizedCountry
    ? countriesByCode[normalizedCountry] || country
    : country;

  return (
    <div className="flex items-center gap-2">
      {normalizedCountry && (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span>
                <CountryFlag countryName={normalizedCountry} size={15} />
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-blue/80 text-white text-xs">
              {countryName}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <span>{countryName}</span>
    </div>
  );
};

export const QuoteHistorySubtable = ({
  products,
  services,
}: QuoteHistorySubtableProps) => {
  const productRows = Array.isArray(products) ? products : [];
  const serviceRows = Array.isArray(services) ? services : [];

  const allRows: TableRow[] = [
    ...productRows.map((item) => ({ type: "product" as const, data: item })),
    ...serviceRows.flatMap((service) => {
      if (
        service.serviceCategory === "Enrollment" &&
        service.enrolledDevices?.length
      ) {
        return service.enrolledDevices.map((device, idx) => ({
          type: "service" as const,
          serviceCategory: service.serviceCategory,
          data: device,
          index: idx,
          total: service.enrolledDevices!.length,
        })) as TableRow[];
      } else if (
        service.serviceCategory === "IT Support" &&
        service.productSnapshot
      ) {
        return [
          {
            type: "service" as const,
            serviceCategory: service.serviceCategory,
            data: service.productSnapshot,
            issues: service.issues,
            description: service.description,
            impactLevel: service.impactLevel,
            issueStartDate: service.issueStartDate,
          },
        ] as TableRow[];
      }
      return [];
    }),
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r w-24 font-semibold text-black text-start">
            Type
          </TableHead>
          <TableHead className="px-4 py-3 border-r w-32 font-semibold text-black text-start">
            Category
          </TableHead>
          <TableHead className="px-4 py-3 border-r w-24 font-semibold text-black text-start">
            Quantity
          </TableHead>
          <TableHead className="px-4 py-3 border-r w-64 font-semibold text-black text-start">
            Details
          </TableHead>
          <TableHead className="px-4 py-3 w-32 font-semibold text-black text-start">
            Required Delivery Date
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allRows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-20 text-xs text-center">
              No items found.
            </TableCell>
          </TableRow>
        ) : (
          allRows.map((row, index) => {
            const isProduct = row.type === "product";
            const isEnrollment = !isProduct && "index" in row;
            const isITSupport = !isProduct && "issues" in row;

            return (
              <TableRow key={index}>
                <TableCell className="px-4 py-2 border-r w-24 text-xs">
                  {isProduct ? "Product" : "Service"}
                </TableCell>
                <TableCell className="px-4 py-2 border-r w-32 text-xs">
                  {isProduct
                    ? (row as any).data.category || "N/A"
                    : (row as any).serviceCategory || "N/A"}
                </TableCell>
                <TableCell className="px-4 py-2 border-r w-24 text-xs">
                  {isProduct ? (row as any).data.quantity ?? 0 : "1"}
                </TableCell>
                <TableCell className="px-4 py-2 border-r w-64 text-xs">
                  <div className="flex flex-col gap-1">
                    {isProduct ? (
                      <>
                        <span>Qty: {(row as any).data.quantity}</span>
                        <QuoteLocationWithCountry
                          country={(row as any).data.country}
                        />
                      </>
                    ) : isEnrollment ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {((row as any).data.brand ||
                          (row as any).data.model) && (
                          <span className="text-gray-700">
                            {(row as any).data.brand}
                            {(row as any).data.brand &&
                              (row as any).data.model &&
                              " - "}
                            {(row as any).data.model}
                          </span>
                        )}
                        {(row as any).data.name && (
                          <span className="text-gray-600 italic">
                            {(row as any).data.name}
                          </span>
                        )}
                        <span className="text-gray-600">
                          SN: {(row as any).data.serialNumber}
                        </span>
                        <span className="text-gray-600">
                          {(row as any).data.assignedTo} (
                          {(row as any).data.location})
                        </span>
                        <QuoteLocationWithCountry
                          country={(row as any).data.countryCode}
                        />
                        {(row as any).data.additionalDetails && (
                          <span className="text-gray-500 text-xs italic">
                            {(row as any).data.additionalDetails}
                          </span>
                        )}
                      </>
                    ) : isITSupport ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {((row as any).data.brand ||
                          (row as any).data.model) && (
                          <span className="text-gray-700">
                            {(row as any).data.brand}
                            {(row as any).data.brand &&
                              (row as any).data.model &&
                              " - "}
                            {(row as any).data.model}
                          </span>
                        )}
                        {(row as any).data.name && (
                          <span className="text-gray-600 italic">
                            {(row as any).data.name}
                          </span>
                        )}
                        <span className="text-gray-600">
                          SN: {(row as any).data.serialNumber}
                        </span>
                        <span className="text-gray-600">
                          {(row as any).data.assignedTo} (
                          {(row as any).data.location})
                        </span>
                        <QuoteLocationWithCountry
                          country={(row as any).data.countryCode}
                        />
                        {(row as any).issues &&
                          (row as any).issues.length > 0 && (
                            <>
                              <span className="text-gray-600">
                                Issues: {(row as any).issues.join(", ")}
                              </span>
                              {(row as any).issueStartDate && (
                                <span className="text-gray-600">
                                  Started:{" "}
                                  {formatDate((row as any).issueStartDate)}
                                </span>
                              )}
                            </>
                          )}
                      </>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2 w-32 text-xs">
                  {isProduct
                    ? formatDate((row as any).data.deliveryDate)
                    : "N/A"}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

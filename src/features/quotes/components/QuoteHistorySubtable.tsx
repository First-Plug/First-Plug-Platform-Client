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
} from "../types/quote.types";
import { countriesByCode } from "@/shared/constants/country-codes";
import { normalizeCountryCode } from "@/shared/utils/countryCodeNormalizer";

interface QuoteHistorySubtableProps {
  products?: QuoteHistoryProduct[];
  services?: QuoteHistoryService[];
}

const formatDate = (date?: string) => {
  if (!date) return "N/A";

  const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return "Invalid date";

  const [, year, month, day] = dateMatch;
  return `${day}/${month}/${year}`;
};

export const QuoteHistorySubtable = ({
  products,
  services,
}: QuoteHistorySubtableProps) => {
  const productRows = Array.isArray(products) ? products : [];
  const serviceRows = Array.isArray(services) ? services : [];
  
  // Combinar productos y servicios en un solo array con tipo identificado
  const allRows = [
    ...productRows.map((item) => ({ type: "product" as const, data: item })),
    ...serviceRows.map((item) => ({ type: "service" as const, data: item })),
  ];

  const renderCountryAndCity = (country?: string, city?: string) => {
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
        <span>{[countryName, city].filter(Boolean).join(" - ") || "N/A"}</span>
      </div>
    );
  };

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
          <TableHead className="px-4 py-3 border-r w-40 font-semibold text-black text-start">
            Country and City
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
          allRows.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="px-4 py-2 border-r w-24 text-xs">
                {row.type === "product" ? "Product" : "Service"}
              </TableCell>
              <TableCell className="px-4 py-2 border-r w-32 text-xs">
                {row.type === "product"
                  ? row.data.category || "N/A"
                  : row.data.serviceCategory || "N/A"}
              </TableCell>
              <TableCell className="px-4 py-2 border-r w-24 text-xs">
                {row.type === "product"
                  ? row.data.quantity ?? 0
                  : "—"}
              </TableCell>
              <TableCell className="px-4 py-2 border-r w-40 text-xs">
                {renderCountryAndCity(row.data.country, row.data.city)}
              </TableCell>
              <TableCell className="px-4 py-2 w-32 text-xs">
                {formatDate(row.data.deliveryDate)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

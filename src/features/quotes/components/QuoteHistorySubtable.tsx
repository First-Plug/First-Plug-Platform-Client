import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";
import type { QuoteHistoryProduct } from "../types/quote.types";
import {
  getCountryNameFromCode,
  getCountryNameForFilter,
} from "@/features/members/utils/countryUtils";

interface QuoteHistorySubtableProps {
  products: QuoteHistoryProduct[];
}

const formatDate = (date?: string) => {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "Invalid date";

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
};

export const QuoteHistorySubtable = ({
  products,
}: QuoteHistorySubtableProps) => {
  const rows = Array.isArray(products) ? products : [];

  const resolveCountry = (country?: string) => {
    if (!country) return null;
    const fromCode = getCountryNameFromCode(country);
    if (fromCode) return fromCode;
    const normalized = getCountryNameForFilter(country);
    return normalized || country;
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
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-20 text-xs text-center">
              No items found.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="px-4 py-2 border-r w-24 text-xs">
                Product
              </TableCell>
              <TableCell className="px-4 py-2 border-r w-32 text-xs">
                {item.category || "N/A"}
              </TableCell>
              <TableCell className="px-4 py-2 border-r w-24 text-xs">
                {item.quantity ?? 0}
              </TableCell>
              <TableCell className="px-4 py-2 border-r w-40 text-xs">
                {(() => {
                  const countryName = resolveCountry(item.country);
                  const city = item.city;
                  const parts = [countryName, city].filter(Boolean);
                  return parts.length > 0 ? parts.join(" - ") : "N/A";
                })()}
              </TableCell>
              <TableCell className="px-4 py-2 w-32 text-xs">
                {formatDate(item.deliveryDate)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

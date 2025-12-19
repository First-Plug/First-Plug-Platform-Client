import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";
import { formatDate } from "@/shared";
import { QuoteLocationWithCountry } from "./QuoteLocationWithCountry";

interface QuoteProduct {
  category: string;
  quantity: number;
  country: string;
  deliveryDate?: string;
}

interface Quote {
  requestId: string;
  products: QuoteProduct[];
}

interface CreateQuotesTableProps {
  data: Quote | Quote[];
}

const CreateQuotesTable: React.FC<CreateQuotesTableProps> = ({ data }) => {
  const normalizedData: Quote[] = Array.isArray(data) ? data : [data];

  // Flatten products with their quote ID
  const flattenedRows = normalizedData.flatMap((quote) =>
    quote.products.map((product) => ({
      quoteId: quote.requestId,
      ...product,
    }))
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Quote ID
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Category
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Quantity
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Location
          </TableHead>
          <TableHead className="px-4 py-3 font-semibold text-black text-start">
            Required Delivery Date
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flattenedRows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No quotes found.
            </TableCell>
          </TableRow>
        ) : (
          flattenedRows.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="px-4 py-2 border-r text-xs">
                {row.quoteId}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {row.category}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {row.quantity}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                <QuoteLocationWithCountry country={row.country} />
              </TableCell>
              <TableCell className="px-4 py-2 text-xs">
                {row.deliveryDate ? formatDate(row.deliveryDate) : "N/A"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CreateQuotesTable;

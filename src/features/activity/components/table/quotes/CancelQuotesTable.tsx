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

interface QuoteService {
  serviceCategory: string;
  issues: string[];
  impactLevel?: string;
  issueStartDate?: string;
  productSnapshot?: {
    category?: string;
    brand?: string;
    model?: string;
    serialNumber: string;
    location: string;
    assignedTo: string;
    countryCode: string;
  };
}

interface Quote {
  requestId: string;
  status?: string;
  products?: QuoteProduct[];
  services?: QuoteService[];
}

interface CancelQuotesTableProps {
  data: {
    oldData: Quote;
    newData: Quote;
  };
}

const CancelQuotesTable: React.FC<CancelQuotesTableProps> = ({ data }) => {
  const { oldData, newData } = data;

  // Flatten products and services from oldData
  const flattenedRows = [];

  // Add product rows
  if (oldData.products && oldData.products.length > 0) {
    oldData.products.forEach((product) => {
      flattenedRows.push({
        quoteId: oldData.requestId,
        type: "product",
        ...product,
      });
    });
  }

  // Add service rows
  if (oldData.services && oldData.services.length > 0) {
    oldData.services.forEach((service) => {
      flattenedRows.push({
        quoteId: oldData.requestId,
        type: "service",
        ...service,
      });
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="w-40 px-4 py-3 border-r font-semibold text-black text-start">
            Quote ID
          </TableHead>
          <TableHead className="w-20 px-4 py-3 border-r font-semibold text-black text-start">
            Type
          </TableHead>
          <TableHead className="w-28 px-4 py-3 border-r font-semibold text-black text-start">
            Category
          </TableHead>
          <TableHead className="w-64 px-4 py-3 border-r font-semibold text-black text-start">
            Details
          </TableHead>
          <TableHead className="w-28 px-4 py-3 font-semibold text-black text-start">
            Date
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flattenedRows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No items found.
            </TableCell>
          </TableRow>
        ) : (
          flattenedRows.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="w-40 px-4 py-2 border-r text-xs">
                {row.quoteId}
              </TableCell>
              <TableCell className="w-20 px-4 py-2 border-r text-xs capitalize">
                {row.type}
              </TableCell>

              {row.type === "product" ? (
                <>
                  <TableCell className="w-28 px-4 py-2 border-r text-xs">
                    {row.category}
                  </TableCell>
                  <TableCell className="w-64 px-4 py-2 border-r text-xs">
                    <div className="flex flex-col gap-1">
                      <span>Qty: {row.quantity}</span>
                      <QuoteLocationWithCountry country={row.country} />
                    </div>
                  </TableCell>
                  <TableCell className="w-28 px-4 py-2 text-xs">
                    {row.deliveryDate ? formatDate(row.deliveryDate) : "N/A"}
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="w-28 px-4 py-2 border-r text-xs">
                    {row.serviceCategory}
                  </TableCell>
                  <TableCell className="w-64 px-4 py-2 border-r text-xs">
                    <div className="flex flex-col gap-1">
                      {row.productSnapshot && (
                        <>
                          <span className="font-semibold">
                            {row.productSnapshot.category}
                          </span>
                          {(row.productSnapshot.brand ||
                            row.productSnapshot.model) && (
                            <span className="text-gray-700">
                              {row.productSnapshot.brand}
                              {row.productSnapshot.brand &&
                                row.productSnapshot.model &&
                                " - "}
                              {row.productSnapshot.model}
                            </span>
                          )}
                          <span className="text-gray-600">
                            SN: {row.productSnapshot.serialNumber}
                          </span>
                          <span className="text-gray-600">
                            {row.productSnapshot.assignedTo} (
                            {row.productSnapshot.location})
                          </span>
                        </>
                      )}
                      {row.issues && row.issues.length > 0 && (
                        <span className="text-gray-600">
                          Issues: {row.issues.join(", ")}
                        </span>
                      )}
                      {row.impactLevel && (
                        <span className="text-xs">
                          Impact: {row.impactLevel}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-28 px-4 py-2 text-xs">
                    {row.issueStartDate
                      ? formatDate(row.issueStartDate)
                      : "N/A"}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CancelQuotesTable;


import { Row } from "@tanstack/react-table";
import type { QuoteTableWithDetailsDto } from "../types/quote.types";
import { QuoteHistorySubtable } from "../components/QuoteHistorySubtable";

export function useQuotesSubtableLogic() {
  const getRowCanExpand = (row: Row<QuoteTableWithDetailsDto>) => {
    return (
      Array.isArray(row.original?.products) && row.original.products.length > 0
    );
  };

  const getRowId = (row: QuoteTableWithDetailsDto) => row._id;

  const renderSubComponent = (row: Row<QuoteTableWithDetailsDto>) => {
    return <QuoteHistorySubtable products={row.original?.products || []} />;
  };

  return {
    getRowCanExpand,
    getRowId,
    renderSubComponent,
  };
}

import { Row } from "@tanstack/react-table";
import type { QuoteTableWithDetailsDto } from "../types/quote.types";
import { QuoteHistorySubtable } from "../components/QuoteHistorySubtable";

export function useQuotesSubtableLogic() {
  const getRowCanExpand = (row: Row<QuoteTableWithDetailsDto>) => {
    const hasProducts =
      Array.isArray(row.original?.products) &&
      row.original.products.length > 0;
    const hasServices =
      Array.isArray(row.original?.services) &&
      row.original.services.length > 0;
    return hasProducts || hasServices;
  };

  const getRowId = (row: QuoteTableWithDetailsDto) => row._id;

  const renderSubComponent = (row: Row<QuoteTableWithDetailsDto>) => {
    return (
      <QuoteHistorySubtable
        products={row.original?.products || []}
        services={row.original?.services || []}
      />
    );
  };

  return {
    getRowCanExpand,
    getRowId,
    renderSubComponent,
  };
}

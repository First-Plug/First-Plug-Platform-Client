import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { QuoteServices } from "../services/quote.services";

export const useFetchQuotesHistory = (
  currentPage: number,
  pageSize: number,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ["quotes-history", currentPage, pageSize, startDate, endDate],
    queryFn: () =>
      QuoteServices.findAll(currentPage, pageSize, startDate, endDate),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

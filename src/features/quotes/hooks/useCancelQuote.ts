import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QuoteServices } from "../services/quote.services";

export const useCancelQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: QuoteServices.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quotes-history"],
      });
    },
    onError: (error: any) => {
      console.error("Error cancelling quote:", error);
    },
  });
};

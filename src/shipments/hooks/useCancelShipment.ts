import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShipmentServices } from "../services/shipments.services";

export const useCancelShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ShipmentServices.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shipments"],
        refetchInactive: true,
      });
    },
    onError: (error: any) => {
      console.error("Error cancelling shipment:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

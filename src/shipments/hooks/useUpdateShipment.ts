import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShipmentServices } from "../services/shipments.services";
import type { UpdateShipment } from "../interfaces/shipments-response.interface";

export const useUpdateShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateShipment }) =>
      ShipmentServices.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shipments"],
        refetchInactive: true,
      });
    },
    onError: (error: any) => {
      console.error("Error updating shipment:", error);
    },
  });
};

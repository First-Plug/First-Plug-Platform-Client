import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  completeUpdateShipment,
  CompleteUpdateShipmentData,
} from "../api/completeUpdateShipment";

export const useCompleteUpdateShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantName,
      shipmentId,
      data,
    }: {
      tenantName: string;
      shipmentId: string;
      data: CompleteUpdateShipmentData;
    }) => completeUpdateShipment(tenantName, shipmentId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics-shipments"] });
      console.log("success");
    },

    onError: (error) => {
      console.error("Error in useCompleteUpdateShipment:", error);
    },
  });
};

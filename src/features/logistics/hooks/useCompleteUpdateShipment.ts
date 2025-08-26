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

    onMutate: async ({ tenantName, shipmentId, data }) => {
      // Cancelar consultas en curso para evitar que sobrescriban nuestro update optimista
      await queryClient.cancelQueries({ queryKey: ["logistics-shipments"] });

      // Guardar el estado anterior para poder hacer rollback si es necesario
      const previousShipments = queryClient.getQueryData([
        "logistics-shipments",
      ]);

      // Update optimista - actualizar la caché inmediatamente
      queryClient.setQueryData(["logistics-shipments"], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((shipment: any) =>
            shipment.id === shipmentId ? { ...shipment, ...data } : shipment
          ),
        };
      });

      // Retornar el contexto con el estado anterior para rollback
      return { previousShipments };
    },

    onSuccess: () => {
      console.log("success");
    },

    onError: (error, variables, context) => {
      console.error("Error in useCompleteUpdateShipment:", error);

      // Si hay error, hacer rollback al estado anterior
      if (context?.previousShipments) {
        queryClient.setQueryData(
          ["logistics-shipments"],
          context.previousShipments
        );
      }
    },

    onSettled: () => {
      // Opcional: invalidar solo después de que todo esté resuelto
      // para asegurar que la caché esté sincronizada
      queryClient.invalidateQueries({ queryKey: ["logistics-shipments"] });
    },
  });
};

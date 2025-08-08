import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogisticOrder } from "../interfaces/logistics";

interface UpdateLogisticsShipmentData {
  shipmentStatus: string;
  price: {
    amount?: string;
    currency?: string;
  };
  shipmentType: string;
  trackingURL: string;
}

// Función para actualizar el envío (simulada por ahora)
const updateLogisticsShipment = async (
  shipmentId: string,
  data: UpdateLogisticsShipmentData
): Promise<LogisticOrder> => {
  // Simular una llamada a la API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Por ahora solo retornamos los datos actualizados
  return {
    orderId: shipmentId,
    tenant: "Empresa A", // Estos datos vendrían de la API
    quantity: 2,
    orderDate: "6/8/2025",
    shipmentStatus: data.shipmentStatus as any,
    price: `${data.price.amount} ${data.price.currency}`,
    origin: "Alan David Cassin",
    destination: "FP Warehouse",
    products: "Samsung Galaxy S23, Samsung EP-TA300",
    shipmentType: data.shipmentType as any,
    trackingURL: data.trackingURL,
    destinationDetails: "Fecha: 19/1/2024",
  };
};

export const useUpdateLogisticsShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shipmentId,
      data,
    }: {
      shipmentId: string;
      data: UpdateLogisticsShipmentData;
    }) => updateLogisticsShipment(shipmentId, data),
    onSuccess: () => {
      // Invalidar las consultas relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ["logistics"] });
    },
  });
};

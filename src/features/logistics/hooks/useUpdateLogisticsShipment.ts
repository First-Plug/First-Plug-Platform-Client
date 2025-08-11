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

const updateLogisticsShipment = async (
  shipmentId: string,
  data: UpdateLogisticsShipmentData
): Promise<LogisticOrder> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    orderId: shipmentId,
    tenant: "Empresa A",
    quantity: 2,
    orderDate: "2025-08-06T00:00:00Z",
    shipmentStatus: data.shipmentStatus as any,
    price: `${data.price.amount} ${data.price.currency}`,
    origin: "Alan David Cassin",
    destination: "FP Warehouse",
    products: "Samsung Galaxy S23, Samsung EP-TA300",
    shipmentType: data.shipmentType as any,
    trackingURL: data.trackingURL,
    destinationDetails: "Fecha: 19/1/2024",
    updatedAt: new Date().toISOString(),
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
      queryClient.invalidateQueries({ queryKey: ["logistics"] });
    },
  });
};

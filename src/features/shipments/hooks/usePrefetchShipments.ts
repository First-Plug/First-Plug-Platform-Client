"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { ShipmentServices } from "../services/shipments.services";
import { Shipment } from "../interfaces/shipments-response.interface";

export const usePrefetchShipments = () => {
  const queryClient = useQueryClient();
  const isPrefetchingRef = useRef(false);

  const prefetchShipments = async () => {
    if (isPrefetchingRef.current) return;
    isPrefetchingRef.current = true;

    try {
      let shipments = queryClient.getQueryData<Shipment[]>(["shipments"]);

      if (!shipments) {
        shipments = await queryClient.fetchQuery<Shipment[]>({
          queryKey: ["shipments"],
          queryFn: async () => {
            return await ShipmentServices.getAll();
          },
          staleTime: 1000 * 60 * 5,
        });
      }
    } catch (error) {
      console.error("Error prefetching shipments:", error);
    } finally {
      isPrefetchingRef.current = false;
    }
  };

  return { prefetchShipments };
};

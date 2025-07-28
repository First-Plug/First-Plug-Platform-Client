"use client";

import { useMemo } from "react";
import { type Shipment } from "../interfaces/shipments-response.interface";

export function useShipmentsFilters(shipments: Shipment[]) {
  const filterOptions = useMemo(() => {
    if (!shipments || shipments.length === 0) {
      return {
        orderIds: [],
        orderDates: [],
        quantities: [],
        types: [],
        statuses: [],
        prices: [],
      };
    }

    return {
      orderIds: Array.from(new Set(shipments.map((s) => s.order_id)))
        .map((orderId) => ({ label: orderId, value: orderId }))
        .sort((a, b) => a.label.localeCompare(b.label)),

      orderDates: Array.from(
        new Set(
          shipments.map((s) =>
            new Date(s.order_date).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          )
        )
      )
        .map((date) => ({ label: date, value: date }))
        .sort((a, b) => a.label.localeCompare(b.label)),

      quantities: Array.from(
        new Set(shipments.map((s) => s.quantity_products.toString()))
      )
        .map((quantity) => ({ label: quantity, value: quantity }))
        .sort((a, b) => parseInt(a.label) - parseInt(b.label)),

      types: Array.from(new Set(shipments.map((s) => s.shipment_type)))
        .map((type) => ({ label: type, value: type }))
        .sort((a, b) => a.label.localeCompare(b.label)),

      statuses: Array.from(new Set(shipments.map((s) => s.shipment_status)))
        .map((status) => ({ label: status, value: status }))
        .sort((a, b) => a.label.localeCompare(b.label)),

      prices: Array.from(
        new Set(
          shipments.map((s) => {
            const { amount, currencyCode } = s.price;
            if (amount === null) return "-";
            if (amount === 0) return "FREE";
            return `${amount} ${currencyCode}`;
          })
        )
      )
        .map((price) => ({ label: price, value: price }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  }, [shipments]);

  return filterOptions;
}

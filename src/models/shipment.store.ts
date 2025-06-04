"use client";
import {
  ShimpentModel,
  Shipment,
  ShipmentByMonth,
  ShipmentByMonthStatus,
  ShipmentByMonthTable,
  IShipmentTable,
} from "@/types";
import { types } from "mobx-state-tree";

export const ShipmentStore = types
  .model({
    shipments: types.array(ShimpentModel),
    selectedShipmentId: types.optional(types.string, ""),
  })
  .views((store) => ({
    get selectedShipment() {
      return store.shipments.find(
        (shipment) => shipment._id === store.selectedShipmentId
      );
    },
    get shipmentsTable() {
      return store.shipments.map(
        (shipment): IShipmentTable => ({
          orderId: shipment._id,
          date: shipment.date,
          type: shipment.type,
          productsQuantity: shipment.products.length,
          price: 0,
          trackingURL: shipment.trackingURL,
          products: shipment.products,
        })
      );
    },

    get shipmentsByMonth(): ShipmentByMonthTable[] {
      const months: ShipmentByMonth[] = Array.from({ length: 12 }).map(
        (m, i) => ({
          month: `${i + 1}`,
          shipments: [] as Shipment[],
          status: "" as ShipmentByMonthStatus,
          price: 0,
        })
      );

      store.shipments.forEach((shipment) => {
        const date = new Date(shipment.date);
        const shipmentMonth = date.getUTCMonth();
        const shipmentYear = date.getUTCFullYear();
        months[shipmentMonth].month = `${shipmentMonth + 1 < 10 && "0"}${
          shipmentMonth + 1
        }/${shipmentYear}`;
        months[shipmentMonth].shipments.push(shipment);
      });
      return months.map(({ month, price, shipments, status }) => ({
        month,
        price,
        shipments: shipments.length,
        status,
      }));
    },
    get shipmentDetails() {
      const shipment = store.shipments.find(
        (shipment) => shipment._id === store.selectedShipmentId
      );

      return shipment?.products || [];
    },

    shipmentByProduct(productId: string) {
      return store.shipments.filter((shipment) =>
        shipment.products.some((product) => product._id === productId)
      );
    },

    shipmentByMember(memberId: string) {
      const shipment = store.shipments.find(
        (shipment) => shipment.memberId === memberId
      );

      return shipment.products;
    },
  }))
  .actions((store) => ({
    setShipments(shipments: Shipment[]) {
      store.shipments.replace(shipments);
    },
    setSelectedShipmentId(shipmentId: Shipment["_id"]) {
      store.selectedShipmentId = shipmentId;
    },
  }));

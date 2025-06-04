"use client";
import { OrderModel, Order } from "@/types";
import { types } from "mobx-state-tree";

export const OrderStore = types
  .model({
    orders: types.array(OrderModel),
    selectedOrderId: types.optional(types.string, ""),
  })
  .views((store) => ({
    get selectedOrder() {
      return store.orders.find((order) => order._id === store.selectedOrderId);
    },
    orderPriceById(orderId: string) {
      const order = store.orders.find((order) => order._id === orderId);

      return order;
    },
  }))

  .actions((store) => ({
    setOrders(orders: Order[]) {
      store.orders.replace(orders);
    },
    setSelectedOrder(orderId: Order["_id"]) {
      store.selectedOrderId = orderId;
    },
  }));

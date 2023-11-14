"use client";
import { createContext, useContext } from "react";
import { types, Instance, SnapshotOut } from "mobx-state-tree";
import { OrderStore } from "./orders.store";
import { ShipmentStore } from "./shipment.store";
import { TeamStore } from "./teams.store";
import { ProductsStore } from "./products.store";
import { MemberStore } from "./member.store";
import { AsideStore } from "./aside.store";

export const RootStore = types.model({
  orders: types.late(() => OrderStore),
  shipments: types.late(() => ShipmentStore),
  teams: types.late(() => TeamStore),
  products: types.late(() => ProductsStore),
  members: types.late(() => MemberStore),
  aside: types.late(() => AsideStore),
});

export const useStore = () => {
  const store = useContext(RootStoreContext);
  if (!store) {
    throw new Error("useRootStore debe usarse dentro de un RootStoreProvider");
  }
  return store;
};

export const RootStoreContext = createContext<Instance<typeof RootStore> | null>(null);
export type RootStoreInstance = Instance<typeof RootStore>;
export type RootStoreSnapshot = SnapshotOut<typeof RootStore>;
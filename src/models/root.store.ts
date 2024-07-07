"use client";
import { createContext, useContext } from "react";
import { types, Instance, SnapshotOut } from "mobx-state-tree";
import {
  AsideStore,
  OrderStore,
  ShipmentStore,
  TeamStore,
  ProductsStore,
  MemberStore,
  UserStore,
  FetchStore,
  AlertStore,
} from "./";

export const RootStore = types
  .model({
    orders: types.late(() => OrderStore),
    shipments: types.late(() => ShipmentStore),
    teams: types.late(() => TeamStore),
    products: types.late(() => ProductsStore),
    members: types.late(() => MemberStore),
    aside: types.late(() => AsideStore),
    user: types.late(() => UserStore),
    alerts: types.late(() => AlertStore),
    mainLoader: types.optional(types.boolean, true),
  })
  .actions((store) => ({
    setMainLoader(status: boolean) {
      store.mainLoader = status;
    },
  }));

export type RootStoreInstance = Instance<typeof RootStore>;
export type RootStoreSnapshot = SnapshotOut<typeof RootStore>;

export const useStore = () => {
  const store = useContext(RootStoreContext);
  if (!store) {
    throw new Error("useRootStore debe usarse dentro de un RootStoreProvider");
  }
  return store;
};

export const RootStoreContext = createContext<RootStoreInstance | null>(null);

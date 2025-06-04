"use client";
import { ALERTS_TYPES, AlertType } from "@/types/alerts";
import { types } from "mobx-state-tree";

export const AlertStore = types
  .model({
    alertType: types.maybe(types.enumeration(ALERTS_TYPES)),
    alertData: types.frozen(),
  })
  .actions((store) => ({
    setAlert(types: AlertType, data?: any) {
      store.alertType = types;
      store.alertData = data || null;
    },
    clearAlert() {
      store.alertType = null;
      store.alertData = null;
    },
  }));

import { ALERTS_TYPES, AlertType } from "@/types/alerts";
import { types } from "mobx-state-tree";

export const AlertStore = types
  .model({
    alertType: types.maybe(types.enumeration(ALERTS_TYPES)),
  })
  .actions((store) => ({
    setAlert(types: AlertType) {
      store.alertType = types;
    },
  }));

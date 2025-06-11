import { create } from "zustand";
import { AlertType } from "@/features/alerts";

interface AlertState {
  alertType: AlertType | null;
  alertData: any | null;
  setAlert: (type: AlertType, data?: any) => void;
  clearAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alertType: null,
  alertData: null,
  setAlert: (type, data) =>
    set({
      alertType: type,
      alertData: data || null,
    }),
  clearAlert: () =>
    set({
      alertType: null,
      alertData: null,
    }),
}));

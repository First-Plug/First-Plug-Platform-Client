import { create } from "zustand";

interface ShipmentStore {
  expandedShipmentId: string | null;
  setExpandedShipmentId: (id: string | null) => void;
}

export const useShipmentStore = create<ShipmentStore>((set) => ({
  expandedShipmentId: null,
  setExpandedShipmentId: (id) => set({ expandedShipmentId: id }),
}));

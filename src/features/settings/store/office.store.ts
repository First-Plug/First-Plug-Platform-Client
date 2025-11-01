"use client";
import { create } from "zustand";
import type { Office } from "../types/settings.types";

interface OfficeState {
  newlyCreatedOffice: Office | null;
  setNewlyCreatedOffice: (office: Office | null) => void;
  clearNewlyCreatedOffice: () => void;
}

export const useOfficeStore = create<OfficeState>((set) => ({
  newlyCreatedOffice: null,
  setNewlyCreatedOffice: (office) => set({ newlyCreatedOffice: office }),
  clearNewlyCreatedOffice: () => set({ newlyCreatedOffice: null }),
}));


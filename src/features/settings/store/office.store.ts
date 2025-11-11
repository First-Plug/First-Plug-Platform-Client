"use client";
import { create } from "zustand";
import type { Office } from "../types/settings.types";

interface OfficeState {
  newlyCreatedOffice: Office | null;
  creationContext: number | null; // índice del producto que activó la creación
  setNewlyCreatedOffice: (office: Office | null, contextIndex?: number) => void;
  clearNewlyCreatedOffice: () => void;
}

interface OfficeCreationContextState {
  productIndex: number | null;
  setProductIndex: (index: number | null) => void;
}

export const useOfficeStore = create<OfficeState>((set) => ({
  newlyCreatedOffice: null,
  creationContext: null,
  setNewlyCreatedOffice: (office, contextIndex) =>
    set({ newlyCreatedOffice: office, creationContext: contextIndex ?? null }),
  clearNewlyCreatedOffice: () =>
    set({ newlyCreatedOffice: null, creationContext: null }),
}));

export const useOfficeCreationContext = create<OfficeCreationContextState>(
  (set) => ({
    productIndex: null,
    setProductIndex: (index) => set({ productIndex: index }),
  })
);

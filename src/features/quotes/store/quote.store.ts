import { create } from "zustand";
import type { QuoteProduct, QuoteStore } from "../types/quote.types";

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  products: [],
  isAddingProduct: false,
  currentStep: 1,
  onBack: undefined,
  onCancel: undefined,

  addProduct: (product: QuoteProduct) => {
    set((state) => ({
      products: [...state.products, product],
    }));
  },

  updateProduct: (id: string, updates: Partial<QuoteProduct>) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id ? { ...product, ...updates } : product
      ),
    }));
  },

  removeProduct: (id: string) => {
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    }));
  },

  clearProducts: () => {
    set({ products: [] });
  },

  getProduct: (id: string) => {
    return get().products.find((product) => product.id === id);
  },

  setIsAddingProduct: (isAdding: boolean) => {
    set({ isAddingProduct: isAdding });
  },

  setCurrentStep: (step: number) => {
    set({ currentStep: step });
  },

  setOnBack: (callback: (() => void) | undefined) => {
    set({ onBack: callback });
  },

  setOnCancel: (callback: (() => void) | undefined) => {
    set({ onCancel: callback });
  },
}));

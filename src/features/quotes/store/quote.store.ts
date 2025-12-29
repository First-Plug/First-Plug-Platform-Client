import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { QuoteProduct, QuoteStore } from "../types/quote.types";

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set, get) => ({
      products: [],
      isAddingProduct: false,
      currentStep: 1,
      currentCategory: undefined,
      editingProductId: undefined,
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

      setCurrentCategory: (category: string | undefined) => {
        set({ currentCategory: category });
      },

      setOnBack: (callback: (() => void) | undefined) => {
        set({ onBack: callback });
      },

      setOnCancel: (callback: (() => void) | undefined) => {
        set({ onCancel: callback });
      },

      setEditingProductId: (id: string | undefined) => {
        set({ editingProductId: id });
      },
    }),
    {
      name: "quote-store", // nombre único para la clave en localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo persistir los productos, no el estado del formulario
      partialize: (state) => ({
        products: state.products,
      }),
    }
  )
);

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  QuoteProduct,
  QuoteService,
  QuoteStore,
} from "../types/quote.types";

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set, get) => ({
      products: [],
      services: [],
      isAddingProduct: false,
      isAddingService: false,
      currentStep: 1,
      currentCategory: undefined,
      currentServiceType: undefined,
      editingProductId: undefined,
      editingServiceId: undefined,
      presetServiceOpen: null,
      onBack: undefined,
      onCancel: undefined,

      setPresetServiceOpen: (preset) => {
        set({ presetServiceOpen: preset });
      },

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

      addService: (service: QuoteService) => {
        set((state) => ({
          services: [...state.services, service],
        }));
      },

      updateService: (id: string, updates: Partial<QuoteService>) => {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id ? { ...service, ...updates } : service
          ),
        }));
      },

      removeService: (id: string) => {
        set((state) => ({
          services: state.services.filter((service) => service.id !== id),
        }));
      },

      clearServices: () => {
        set({ services: [] });
      },

      getService: (id: string) => {
        return get().services.find((service) => service.id === id);
      },

      setIsAddingProduct: (isAdding: boolean) => {
        set({ isAddingProduct: isAdding });
      },

      setIsAddingService: (isAdding: boolean) => {
        set({ isAddingService: isAdding });
      },

      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },

      setCurrentCategory: (category: string | undefined) => {
        set({ currentCategory: category });
      },

      setCurrentServiceType: (serviceType: string | undefined) => {
        set({ currentServiceType: serviceType });
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

      setEditingServiceId: (id: string | undefined) => {
        set({ editingServiceId: id });
      },
    }),
    {
      name: "quote-store", // nombre único para la clave en localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo persistir los productos y servicios, no el estado del formulario
      partialize: (state) => ({
        products: state.products,
        services: state.services,
      }),
      // Migración: asegurar que los nuevos campos tengan valores por defecto
      merge: (persistedState: any, currentState: any) => {
        return {
          ...currentState,
          ...persistedState,
          // Asegurar que services existe y es un array
          services: persistedState?.services || [],
          // Asegurar que los estados del formulario no se persistan
          isAddingProduct: false,
          isAddingService: false,
          currentStep: 1,
          currentCategory: undefined,
          currentServiceType: undefined,
          editingProductId: undefined,
          editingServiceId: undefined,
          presetServiceOpen: null,
          onBack: undefined,
          onCancel: undefined,
        };
      },
    }
  )
);

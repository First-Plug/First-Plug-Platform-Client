import { type Product } from "@/features/assets";
import { create } from "zustand";

interface ProductStore {
  onlyAvailable: boolean;
  setOnlyAvailable: (value: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  selectedCountry: string | null;
  setSelectedCountry: (country: string | null) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  onlyAvailable: false,
  selectedProduct: null,
  selectedCountry: null,
  setOnlyAvailable: (value) => set({ onlyAvailable: value }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
}));

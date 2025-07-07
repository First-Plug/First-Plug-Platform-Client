import { create } from "zustand";

export function createFilterStore() {
  return create<{
    filters: Record<string, string[]>;
    setFilter: (column: string, values: string[]) => void;
    clearFilters: () => void;
    onFiltersChange?: () => void;
    setOnFiltersChange: (callback: () => void) => void;
  }>((set, get) => ({
    filters: {},
    onFiltersChange: undefined,
    setOnFiltersChange: (callback) => set({ onFiltersChange: callback }),
    setFilter: (column, values) =>
      set((state) => {
        const newFilters = { ...state.filters };

        if (values.length === 0) {
          // Si el array está vacío, eliminar la key del objeto
          delete newFilters[column];
        } else {
          // Si hay valores, agregar o actualizar la key
          newFilters[column] = values;
        }

        // Notificar que los filtros cambiaron
        const { onFiltersChange } = get();
        if (onFiltersChange) {
          onFiltersChange();
        }

        return { filters: newFilters };
      }),
    clearFilters: () => {
      const { onFiltersChange } = get();
      if (onFiltersChange) {
        onFiltersChange();
      }
      set({ filters: {} });
    },
  }));
}

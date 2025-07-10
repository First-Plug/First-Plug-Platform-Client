import { create } from "zustand";

export function createFilterStore() {
  return create<{
    filters: Record<string, string[]>;
    pageIndex: number;
    pageSize: number;
    setFilter: (column: string, values: string[]) => void;
    clearFilters: () => void;
    setPageIndex: (pageIndex: number) => void;
    setPageSize: (pageSize: number) => void;
    onFiltersChange?: () => void;
    setOnFiltersChange: (callback: () => void) => void;
  }>((set, get) => ({
    filters: {},
    pageIndex: 0,
    pageSize: 10,
    onFiltersChange: undefined,
    setOnFiltersChange: (callback) => set({ onFiltersChange: callback }),

    setPageIndex: (pageIndex) => set({ pageIndex }),

    setPageSize: (pageSize) => set({ pageSize, pageIndex: 0 }), // Resetear a primera página al cambiar tamaño

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

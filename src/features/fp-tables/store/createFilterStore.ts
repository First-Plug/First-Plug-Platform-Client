import { create } from "zustand";

export function createFilterStore() {
  return create<{
    filters: Record<string, string[]>;
    pageIndex: number;
    pageSize: number;
    expandedRows: Record<string, boolean>;
    setFilter: (column: string, values: string[]) => void;
    clearFilters: () => void;
    setPageIndex: (pageIndex: number) => void;
    setPageSize: (pageSize: number) => void;
    onFiltersChange?: () => void;
    setOnFiltersChange: (callback: () => void) => void;
    toggleRowExpansion: (rowId: string) => void;
    setExpandedRows: (expandedRows: Record<string, boolean>) => void;
    collapseAllRows: () => void;
    // Nuevas funciones para manejar múltiples tablas
    setFilterForTable: (
      tableId: string,
      column: string,
      values: string[]
    ) => void;
    clearFiltersForTable: (tableId: string) => void;
    getFiltersForTable: (tableId: string) => Record<string, string[]>;
    getPageIndexForTable: (tableId: string) => number;
    getPageSizeForTable: (tableId: string) => number;
    setPageIndexForTable: (tableId: string, pageIndex: number) => void;
    setPageSizeForTable: (tableId: string, pageSize: number) => void;
  }>((set, get) => ({
    filters: {},
    pageIndex: 0,
    pageSize: 10,
    expandedRows: {},
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
    toggleRowExpansion: (rowId) =>
      set((state) => {
        const newExpandedRows = { ...state.expandedRows };
        if (newExpandedRows[rowId]) {
          delete newExpandedRows[rowId];
        } else {
          newExpandedRows[rowId] = true;
        }
        return { expandedRows: newExpandedRows };
      }),
    setExpandedRows: (expandedRows) => set({ expandedRows }),
    collapseAllRows: () => set({ expandedRows: {} }),

    // Nuevas funciones para manejar múltiples tablas
    setFilterForTable: (tableId, column, values) => {
      // Para las tablas con tableId, usamos prefijos para evitar conflictos
      const prefixedColumn = tableId ? `${tableId}_${column}` : column;
      get().setFilter(prefixedColumn, values);
    },
    clearFiltersForTable: (tableId) => {
      if (tableId === "all") {
        // Limpiar todos los filtros
        get().clearFilters();
      } else {
        // Limpiar solo los filtros de esta tabla específica
        const currentFilters = get().filters;
        const newFilters = { ...currentFilters };

        // Eliminar todos los filtros que empiecen con el tableId
        Object.keys(newFilters).forEach((key) => {
          if (key.startsWith(`${tableId}_`)) {
            delete newFilters[key];
          }
        });

        set({ filters: newFilters });
      }
    },
    getFiltersForTable: (tableId) => {
      if (!tableId) {
        return get().filters;
      }

      // Filtrar solo los filtros que pertenecen a esta tabla
      const allFilters = get().filters;
      const tableFilters: Record<string, string[]> = {};

      Object.entries(allFilters).forEach(([key, values]) => {
        if (key.startsWith(`${tableId}_`)) {
          const column = key.replace(`${tableId}_`, "");
          tableFilters[column] = values;
        }
      });

      return tableFilters;
    },
    getPageIndexForTable: (tableId) => {
      // Por ahora, todas las tablas comparten el mismo pageIndex
      return get().pageIndex;
    },
    getPageSizeForTable: (tableId) => {
      // Por ahora, todas las tablas comparten el mismo pageSize
      return get().pageSize;
    },
    setPageIndexForTable: (tableId, pageIndex) => {
      // Por ahora, todas las tablas comparten el mismo pageIndex
      get().setPageIndex(pageIndex);
    },
    setPageSizeForTable: (tableId, pageSize) => {
      // Por ahora, todas las tablas comparten el mismo pageSize
      get().setPageSize(pageSize);
    },
  }));
}

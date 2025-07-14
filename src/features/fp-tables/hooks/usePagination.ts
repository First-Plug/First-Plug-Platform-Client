import { useRef } from "react";

export interface UsePaginationOptions {
  defaultPageSize?: number;
  pageSizes?: number[];
  useFilterStore: any; // Store de Zustand que incluye pageIndex y pageSize
}

export const usePagination = (options: UsePaginationOptions) => {
  const { pageSizes = [10, 25, 50, 100], useFilterStore } = options;

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Obtener valores del store
  const pageIndex = useFilterStore((s: any) => s.pageIndex);
  const pageSize = useFilterStore((s: any) => s.pageSize);
  const setPageIndex = useFilterStore((s: any) => s.setPageIndex);
  const setPageSize = useFilterStore((s: any) => s.setPageSize);

  // Función para hacer scroll al principio de la tabla
  const scrollToTop = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    // Hacer scroll al principio de la tabla cuando cambia la página
    setTimeout(() => scrollToTop(), 100);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    // Hacer scroll al principio de la tabla cuando cambia el tamaño
    setTimeout(() => scrollToTop(), 100);
  };

  const resetToFirstPage = () => {
    setPageIndex(0);
    // Hacer scroll al principio de la tabla
    setTimeout(() => scrollToTop(), 100);
  };

  return {
    pageIndex,
    pageSize,
    pageSizes,
    handlePageChange,
    handlePageSizeChange,
    resetToFirstPage,
    tableContainerRef,
  };
};

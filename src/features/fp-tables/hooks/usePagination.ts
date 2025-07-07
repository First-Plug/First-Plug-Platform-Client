import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface UsePaginationOptions {
  defaultPageSize?: number;
  pageSizes?: number[];
}

export const usePagination = (options: UsePaginationOptions = {}) => {
  const { defaultPageSize = 10, pageSizes = [10, 25, 50, 100] } = options;

  const router = useRouter();
  const searchParams = useSearchParams();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Obtener valores de la URL
  const pageParam = searchParams.get("page");
  const sizeParam = searchParams.get("size");

  // Validar y convertir valores
  const pageFromUrl = pageParam ? Math.max(1, parseInt(pageParam) || 1) : 1;
  const initialPageIndex = pageFromUrl - 1; // Convertir a 0-based

  const parsedSize = sizeParam ? parseInt(sizeParam) : defaultPageSize;
  const initialPageSize = pageSizes.includes(parsedSize)
    ? parsedSize
    : defaultPageSize;

  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Función para hacer scroll al principio de la tabla
  const scrollToTop = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Sincronizar con URL cuando cambien los valores
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    // Verificar página
    const currentPage = currentParams.get("page");
    const newPage = (pageIndex + 1).toString();
    if (currentPage !== newPage) {
      hasChanges = true;
      currentParams.set("page", newPage);
    }

    // Verificar tamaño
    const currentSize = currentParams.get("size");
    const newSize = pageSize.toString();
    if (currentSize !== newSize) {
      hasChanges = true;
      currentParams.set("size", newSize);
    }

    if (hasChanges) {
      const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [pageIndex, pageSize, router, searchParams]);

  // Sincronizar desde URL solo al cargar inicialmente
  useEffect(() => {
    const urlPageParam = searchParams.get("page");
    const urlSizeParam = searchParams.get("size");

    if (urlPageParam) {
      const urlPage = Math.max(1, parseInt(urlPageParam) || 1);
      const urlPageIndex = urlPage - 1;
      if (urlPageIndex !== pageIndex) {
        setPageIndex(urlPageIndex);
      }
    }

    if (urlSizeParam) {
      const urlSize = parseInt(urlSizeParam);
      if (pageSizes.includes(urlSize) && urlSize !== pageSize) {
        setPageSize(urlSize);
      }
    }
  }, []); // Solo ejecutar al montar el componente

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    // Hacer scroll al principio de la tabla cuando cambia la página
    setTimeout(() => scrollToTop(), 100);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Resetear a la primera página
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

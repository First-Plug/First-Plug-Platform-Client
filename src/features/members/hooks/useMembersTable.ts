"use client";
import { useMemo, useEffect } from "react";
import { Member } from "@/features/members";
import { usePagination, createFilterStore } from "@/features/fp-tables";

const useMembersTableFilterStore = createFilterStore();

export const useMembersTable = (members: Member[]) => {
  const filters = useMembersTableFilterStore((s) => s.filters);
  const setOnFiltersChange = useMembersTableFilterStore(
    (s) => s.setOnFiltersChange
  );

  const {
    pageIndex,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetToFirstPage,
    tableContainerRef,
  } = usePagination({
    useFilterStore: useMembersTableFilterStore,
    defaultPageSize: 10,
    pageSizes: [10, 25, 50, 100],
  });

  // Configurar el callback para resetear la paginación cuando cambien los filtros
  useEffect(() => {
    setOnFiltersChange(() => {
      resetToFirstPage();
    });
  }, [setOnFiltersChange, resetToFirstPage]);

  // Función para filtrar los miembros según los filtros aplicados
  const filteredMembers = useMemo(() => {
    if (!members || Object.keys(filters).length === 0) {
      // Ordenar por fecha de creación (startDate) de más reciente a más antigua
      return [...members].sort((a, b) => {
        const dateA = new Date(a.startDate || "");
        const dateB = new Date(b.startDate || "");
        return dateB.getTime() - dateA.getTime();
      });
    }

    const filtered = members.filter((member) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "fullName":
            const fullName = `${member.firstName} ${member.lastName}`;
            return filterValues.some((value) =>
              fullName.toLowerCase().includes(value.toLowerCase())
            );

          case "country":
            const country = member.country || "";
            return filterValues.some((value) =>
              country.toLowerCase().includes(value.toLowerCase())
            );

          case "birthDate":
            const birthMonth = new Date(member.birthDate).getMonth() + 1;
            const birthMonthStr = birthMonth.toString().padStart(2, "0");
            return filterValues.includes(birthMonthStr);

          case "startDate":
            const startMonth = new Date(member.startDate).getMonth() + 1;
            const startMonthStr = startMonth.toString().padStart(2, "0");
            return filterValues.includes(startMonthStr);

          case "team":
            const teamName = member.team?.name || "";
            return filterValues.some((value) =>
              teamName.toLowerCase().includes(value.toLowerCase())
            );

          case "position":
            const position = member.position || "";
            return filterValues.some((value) =>
              position.toLowerCase().includes(value.toLowerCase())
            );

          case "products":
            const productCount = (member.products || []).length;
            return filterValues.some(
              (value) => productCount.toString() === value
            );

          default:
            return true;
        }
      });
    });

    // Ordenar los resultados filtrados por fecha de creación (startDate) de más reciente a más antigua
    return filtered.sort((a, b) => {
      const dateA = new Date(a.startDate || "");
      const dateB = new Date(b.startDate || "");
      return dateB.getTime() - dateA.getTime();
    });
  }, [members, filters]);

  // Calcular datos paginados
  const paginatedMembers = useMemo(() => {
    if (!filteredMembers) return [];

    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredMembers.slice(startIndex, endIndex);
  }, [filteredMembers, pageIndex, pageSize]);

  // Calcular el número total de páginas
  const totalPages = useMemo(() => {
    if (!filteredMembers) return 1;
    return Math.ceil(filteredMembers.length / pageSize);
  }, [filteredMembers, pageSize]);

  const handleClearAllFilters = () => {
    useMembersTableFilterStore.getState().clearFilters();
  };

  return {
    // Estado de paginación
    pageIndex,
    pageSize,
    totalPages,

    // Handlers
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,

    // Datos
    filteredMembers,
    paginatedMembers,

    // Referencias
    tableContainerRef,

    // Store para filtros
    useMembersTableFilterStore,
  };
};

"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { createFilterStore, usePagination } from "@/features/fp-tables";
import { type Shipment } from "../interfaces/shipments-response.interface";
import { useShipmentStore } from "../store/useShipmentStore";

const useShipmentsTableFilterStore = createFilterStore();

export { useShipmentsTableFilterStore };

export function useShipmentsTable(shipments: Shipment[]) {
  const filters = useShipmentsTableFilterStore((s) => s.filters);
  const setOnFiltersChange = useShipmentsTableFilterStore(
    (s) => s.setOnFiltersChange
  );
  const expandedRows = useShipmentsTableFilterStore((s) => s.expandedRows);
  const toggleRowExpansion = useShipmentsTableFilterStore(
    (s) => s.toggleRowExpansion
  );

  // Store para manejar la expansión (como en la tabla original)
  const expandedShipmentId = useShipmentStore(
    (state) => state.expandedShipmentId
  );
  const setExpandedShipmentId = useShipmentStore(
    (state) => state.setExpandedShipmentId
  );

  // Sincronizar el estado del store original con el filter store
  useEffect(() => {
    if (expandedShipmentId) {
      // Convertir el expandedShipmentId a expandedRows para el DataTable
      const expandedRows = { [expandedShipmentId]: true };
      useShipmentsTableFilterStore.getState().setExpandedRows(expandedRows);
    } else {
      // Limpiar expandedRows si no hay expandedShipmentId
      useShipmentsTableFilterStore.getState().setExpandedRows({});
    }
  }, [expandedShipmentId]);

  const {
    pageIndex,
    pageSize,
    handlePageChange: originalHandlePageChange,
    handlePageSizeChange,
    resetToFirstPage,
    tableContainerRef,
  } = usePagination({
    useFilterStore: useShipmentsTableFilterStore,
    defaultPageSize: 10,
    pageSizes: [10, 25, 50, 100],
  });

  // Versión personalizada de handlePageChange que no hace scroll automático
  const handlePageChange = (newPageIndex: number) => {
    const setPageIndex = useShipmentsTableFilterStore.getState().setPageIndex;
    setPageIndex(newPageIndex);

    // Solo hacer scroll automático si NO está en modo posicionamiento
    if (!isPositioning) {
      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  // Ref para el row expandido (como en la tabla original)
  const expandedRowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    setOnFiltersChange(() => {
      resetToFirstPage();
    });
  }, [setOnFiltersChange, resetToFirstPage]);

  // Aplicar filtros a los datos
  const filteredShipments = useMemo(() => {
    console.log("Filtros actuales:", filters);
    console.log("Datos originales:", shipments?.length);

    if (!shipments || Object.keys(filters).length === 0) {
      console.log("Sin filtros aplicados, retornando todos los datos");
      return shipments;
    }

    const filtered = shipments.filter((shipment) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "order_id":
            return filterValues.some((value) => shipment.order_id === value);

          case "order_date":
            const shipmentDate = new Date(
              shipment.order_date
            ).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            return filterValues.some((value) => shipmentDate === value);

          case "quantity_products":
            return filterValues.some(
              (value) => shipment.quantity_products.toString() === value
            );

          case "shipment_type":
            return filterValues.some(
              (value) => shipment.shipment_type === value
            );

          case "shipment_status":
            return filterValues.some(
              (value) => shipment.shipment_status === value
            );

          case "price":
            const { amount, currencyCode } = shipment.price;
            let priceString = "-";
            if (amount === null) priceString = "No Data";
            else if (amount === 0) priceString = "FREE";
            else priceString = `${amount} ${currencyCode}`;
            return filterValues.some((value) => priceString === value);

          default:
            return true;
        }
      });
    });

    console.log("Datos filtrados:", filtered.length);
    return filtered;
  }, [shipments, filters]);

  // Paginación client-side de los datos filtrados
  const paginatedShipments = useMemo(() => {
    if (!filteredShipments) return [];

    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filteredShipments.slice(startIndex, endIndex);

    console.log("Paginación:", {
      pageIndex,
      pageSize,
      totalPages: Math.ceil(filteredShipments.length / pageSize),
      startIndex,
      endIndex,
      paginatedLength: paginated.length,
      totalFiltered: filteredShipments.length,
    });

    return paginated;
  }, [filteredShipments, pageIndex, pageSize]);

  const totalPages = useMemo(() => {
    if (!filteredShipments) return 1;
    return Math.ceil(filteredShipments.length / pageSize);
  }, [filteredShipments, pageSize]);

  const handleClearAllFilters = () => {
    useShipmentsTableFilterStore.getState().clearFilters();
  };

  const getRowCanExpand = (row: any) => {
    return true; // Todas las filas pueden expandirse para mostrar detalles
  };

  const getRowId = (row: Shipment) => {
    return row._id;
  };

  // Función para expandir una fila específica
  const expandRow = (shipmentId: string) => {
    setExpandedShipmentId(shipmentId);

    // También sincronizar con el filter store para el DataTable
    const expandedRows = { [shipmentId]: true };
    useShipmentsTableFilterStore.getState().setExpandedRows(expandedRows);
  };

  // Función para hacer scroll a una fila específica
  const scrollToRow = (shipmentId: string) => {
    if (!tableContainerRef.current) {
      return;
    }

    // Encontrar el elemento de la fila en el DOM
    const rowElement = tableContainerRef.current.querySelector(
      `[data-row-id="${shipmentId}"]`
    );

    if (rowElement) {
      rowElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  };

  // Estado para controlar el posicionamiento
  const [isPositioning, setIsPositioning] = useState(false);

  // Función para scroll automático y expansión de fila
  const scrollToAndExpandRow = (shipmentId: string) => {
    setIsPositioning(true);

    // Encontrar el shipment en los datos filtrados
    const targetShipmentIndex = filteredShipments.findIndex(
      (shipment) => shipment._id === shipmentId
    );

    if (targetShipmentIndex === -1) {
      setIsPositioning(false);
      return;
    }

    // Calcular en qué página está el shipment
    const targetPageIndex = Math.floor(targetShipmentIndex / pageSize);

    // Si no está en la página actual, navegar a esa página
    if (targetPageIndex !== pageIndex) {
      handlePageChange(targetPageIndex);

      // Esperar a que la página se actualice y luego expandir y hacer scroll
      setTimeout(() => {
        expandRow(shipmentId);
        setTimeout(() => {
          scrollToRow(shipmentId);
          setIsPositioning(false);
        }, 100);
      }, 100);
    } else {
      // Si ya está en la página correcta, expandir y hacer scroll
      expandRow(shipmentId);
      setTimeout(() => {
        scrollToRow(shipmentId);
        setIsPositioning(false);
      }, 100);
    }
  };

  return {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    filteredShipments,
    paginatedShipments,
    tableContainerRef,
    useShipmentsTableFilterStore,
    expandedRows,
    toggleRowExpansion,
    getRowCanExpand,
    getRowId,
    scrollToAndExpandRow,
    expandedRowRef,
    expandedShipmentId,
    setExpandedShipmentId,
    isPositioning,
  };
}

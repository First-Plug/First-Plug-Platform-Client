"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DataTable } from "@/features/fp-tables";
import { type Shipment } from "../interfaces/shipments-response.interface";
import { ShipmentDetailsTable } from "./shipments-details-table";
import { useShipmentStore } from "../store/useShipmentStore";
import { ShipmentServices } from "../services/shipments.services";

interface ShipmentsDataTableProps {
  shipments: Shipment[];
  totalCount: number;
  isLoading: boolean;
  useFilterStore: any;
}

export const ShipmentsDataTable = ({
  shipments,
  totalCount,
  isLoading,
  useFilterStore,
}: ShipmentsDataTableProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shipmentId = searchParams.get("id");

  const expandedShipmentId = useShipmentStore(
    (state) => state.expandedShipmentId
  );

  const setExpandedShipmentId = useShipmentStore(
    (state) => state.setExpandedShipmentId
  );

  const [initialLoadDone, setInitialLoadDone] = React.useState(false);

  // Ref para el row expandido y el contenedor scrollable
  const expandedRowRef = useRef<HTMLTableRowElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shipmentId) {
      setExpandedShipmentId(shipmentId);
    }
  }, [shipmentId, setExpandedShipmentId]);

  useEffect(() => {
    if (!initialLoadDone && shipmentId && shipments) {
      const shipmentIndex = shipments.findIndex((s) => s._id === shipmentId);
      if (shipmentIndex === -1 && !isLoading) {
        // TODO: Implementar lógica para encontrar la página del shipment
        // Por ahora solo marcamos como cargado
        setInitialLoadDone(true);
      } else {
        setInitialLoadDone(true);
      }
    }
  }, [shipmentId, shipments, isLoading, initialLoadDone]);

  useEffect(() => {
    const isExpandedShipmentInData = shipments.some(
      (s) => s._id === expandedShipmentId
    );

    if (
      expandedShipmentId &&
      isExpandedShipmentInData &&
      !isLoading &&
      initialLoadDone
    ) {
      const timeoutId = setTimeout(() => {
        const row = expandedRowRef.current;
        if (row) {
          row.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [expandedShipmentId, shipments, isLoading, initialLoadDone]);

  const getRowCanExpand = (row: any) => {
    return true; // Todas las filas pueden expandirse para mostrar detalles
  };

  const getRowId = (row: Shipment) => {
    return row._id;
  };

  const renderSubComponent = (row: any) => {
    return (
      <div className="bg-white w-full">
        <ShipmentDetailsTable data={row.original} />
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0">
      <DataTable
        columns={[]} // Las columnas se pasan desde el componente padre
        data={shipments}
        useFilterStore={useFilterStore}
        rowHeight={46}
        scrollContainerRef={scrollContainerRef}
        getRowCanExpand={getRowCanExpand}
        renderSubComponent={renderSubComponent}
        getRowId={getRowId}
        adaptiveHeight={false}
        enableSnapScroll={false}
      />
    </div>
  );
};

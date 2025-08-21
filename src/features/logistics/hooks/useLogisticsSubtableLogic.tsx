"use client";
import React, { useMemo } from "react";
import { type Row } from "@tanstack/react-table";
import { LogisticOrder } from "../interfaces/logistics";
import { ExpandedRowContent } from "../components/ExpandedRowContent";

export function useLogisticsSubtableLogic() {
  const getRowCanExpand = (row: Row<LogisticOrder>) => {
    // Todas las filas pueden expandirse para mostrar detalles
    return true;
  };

  const getRowId = (row: LogisticOrder) => {
    return row.orderId;
  };

  const renderSubComponent = useMemo(() => {
    const component = (row: Row<LogisticOrder>) => {
      const order = row.original;
      return <ExpandedRowContent order={order} />;
    };
    component.displayName = "RenderSubComponent";
    return component;
  }, []);

  return {
    getRowCanExpand,
    getRowId,
    renderSubComponent,
  };
}

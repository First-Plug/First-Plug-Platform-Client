"use client";

import { useShipmentsTableFilterStore } from "../hooks/useShipmentsTable";

export const ShipmentsDebug = () => {
  const filters = useShipmentsTableFilterStore((s) => s.filters);

  return (
    <div className="bg-yellow-100 mb-4 p-4 rounded">
      <h3 className="mb-2 font-bold">Debug - Filtros Activos:</h3>
      <pre className="text-xs">{JSON.stringify(filters, null, 2)}</pre>
    </div>
  );
};

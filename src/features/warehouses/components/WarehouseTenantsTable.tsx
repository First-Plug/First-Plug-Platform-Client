"use client";

import { DataTable } from "@/features/fp-tables";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { WarehouseTenantSummary } from "../interfaces/warehouse.interface";

interface Props {
  tenants: WarehouseTenantSummary[];
  useFilterStore: any;
  tableId?: string;
}

export const WarehouseTenantsTable = ({
  tenants,
  useFilterStore,
  tableId,
}: Props) => {
  const columns = useMemo<ColumnDef<WarehouseTenantSummary>[]>(
    () => [
      { accessorKey: "tenantName", header: "Tenant Name", size: 200 },
      { accessorKey: "companyName", header: "Company Name", size: 260 },
      {
        accessorKey: "computers",
        header: "Computers",
        size: 120,
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("computers")}</span>
        ),
      },
      {
        accessorKey: "otherProducts",
        header: "Other Products",
        size: 140,
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("otherProducts")}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="w-full">
      <div className="bg-white">
        <DataTable
          columns={columns}
          data={tenants}
          useFilterStore={useFilterStore}
          tableId={tableId}
          rowHeight={64}
          adaptiveHeight={true}
          enableSnapScroll={false}
        />
      </div>
    </div>
  );
};

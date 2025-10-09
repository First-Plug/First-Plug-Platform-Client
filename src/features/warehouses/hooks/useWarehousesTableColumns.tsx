import { ColumnDef } from "@tanstack/react-table";
import { Warehouse } from "../interfaces/warehouse.interface";
import { useMemo } from "react";
import { WarehousesTableActions } from "../components/WarehousesTableActions";
import { countriesByCode } from "@/shared";

import { DetailsButton } from "@/shared/components/Tables/DetailButton";

interface UseWarehousesTableColumnsProps {
  warehouses: Warehouse[];
  onDeleteWarehouse?: (id: string) => void | Promise<void>;
}

export const useWarehousesTableColumns = ({
  warehouses,
  onDeleteWarehouse,
}: UseWarehousesTableColumnsProps): ColumnDef<Warehouse>[] => {
  const filterOptions = useMemo(() => {
    const names = Array.from(
      new Set(warehouses.map((warehouse) => warehouse.name))
    ).sort();

    const countries = Array.from(
      new Set(warehouses.map((warehouse) => warehouse.countryCode))
    ).sort();

    const partnerTypes = Array.from(
      new Set(warehouses.map((warehouse) => warehouse.partnerType))
    ).sort();

    const activeStatuses = Array.from(
      new Set(warehouses.map((warehouse) => warehouse.isActive))
    ).sort();

    const tenantCounts = warehouses.map((warehouse) => warehouse.tenantCount);
    const uniqueTenantCounts = Array.from(new Set(tenantCounts)).sort(
      (a, b) => a - b
    );

    const totalProducts = warehouses.map(
      (warehouse) => warehouse.totalProducts
    );
    const uniqueTotalProducts = Array.from(new Set(totalProducts)).sort(
      (a, b) => a - b
    );

    return {
      names: names.map((name) => ({ label: name, value: name })),
      countries: countries.map((countryCode) => ({
        label: countriesByCode[countryCode] || countryCode,
        value: countryCode,
      })),
      partnerTypes: partnerTypes.map((type) => ({ label: type, value: type })),
      activeStatuses: activeStatuses.map((status) => ({
        label: status ? "Yes" : "No",
        value: status.toString(),
      })),
      tenantCounts: uniqueTenantCounts.map((count) => ({
        label: count === 1 ? `${count} tenant` : `${count} tenants`,
        value: count.toString(),
      })),
      totalProducts: uniqueTotalProducts.map((products) => ({
        label: `${products} products`,
        value: products.toString(),
      })),
    };
  }, [warehouses]);

  const columns = useMemo<ColumnDef<Warehouse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Warehouse Name",
        size: 160,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.names,
        },
        cell: ({ row }) => (
          <div className="flex items-center">
            <span className="font-medium">{row.getValue("name")}</span>
          </div>
        ),
        filterOptions: filterOptions.names,
      },
      {
        accessorKey: "countryCode",
        header: "Country",
        size: 100,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.countries,
        },
        cell: ({ row }) => {
          const countryCode = row.getValue("countryCode") as string;
          return <span>{countriesByCode[countryCode] || countryCode}</span>;
        },
        filterOptions: filterOptions.countries,
      },
      {
        accessorKey: "partnerType",
        header: "Partner Type",
        size: 120,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.partnerTypes,
        },
        cell: ({ row }) => {
          const type = row.getValue("partnerType") as string;
          const getBadgeColor = (type: string) => {
            switch (type) {
              case "temporary":
                return "bg-[#FFE9AF] text-[#8B6B00]";
              case "own":
                return "bg-[#D8E7FF] text-[#18489A]";
              case "partner":
                return "bg-[#AAF6CD] text-[#2E7B32]";
              default:
                return "bg-[#F7F7F9] text-[#5D6470]";
            }
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(
                type
              )}`}
            >
              {type}
            </span>
          );
        },
        filterOptions: filterOptions.partnerTypes,
      },
      {
        accessorKey: "isActive",
        header: "Is Active",
        size: 90,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.activeStatuses,
        },
        cell: ({ row }) => {
          const isActive = row.getValue("isActive") as boolean;
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-[#AAF6CD] text-[#2E7B32]"
                  : "bg-[#FFC6D3] text-[#B73232]"
              }`}
            >
              {isActive ? "Yes" : "No"}
            </span>
          );
        },
        filterOptions: filterOptions.activeStatuses,
      },
      {
        accessorKey: "tenantCount",
        header: "Number of Tenants",
        size: 100,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.tenantCounts,
        },
        filterOptions: filterOptions.tenantCounts,
      },
      {
        accessorKey: "totalProducts",
        header: "Total Products",
        size: 90,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.totalProducts,
        },
        filterOptions: filterOptions.totalProducts,
      },
      {
        id: "actions",
        header: "Actions",
        size: 80,
        cell: ({ row }) => {
          return (
            <WarehousesTableActions
              warehouse={row.original}
              onDeleteWarehouse={onDeleteWarehouse}
            />
          );
        },
      },

      {
        id: "expander",
        header: () => null,
        size: 100,
        cell: ({ row }) => {
          return <DetailsButton row={row} />;
        },
      },
    ],
    [filterOptions, onDeleteWarehouse]
  );

  return columns;
};

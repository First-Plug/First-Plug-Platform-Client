"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RootTable } from "../RootTable";
import { Location, Product } from "@/features/assets";
import { LOCATION } from "@/features/assets/interfaces/product";
import { ShipmentStatus } from "@/features/shipments";
import { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import { FormatedDate } from "@/shared/components/Tables";
import MemberName from "../helpers/MemberName";
import { ShipmentStatusCard } from "@/features/shipments";
import { ProductLocation } from "@/shared/components/Tables";
import { ActionButton } from "./ActionButton";
import EditProduct from "./EditProduct";
import { DeleteAction } from "@/shared";
import { usePrefetchAsset } from "@/features/assets";
import { ProductConditionCard } from "@/features/assets";

interface IProdcutsDetailsTable {
  products: Product[];
  onClearFilters?: () => void;
  onSubTableInstance?: (instance: any) => void;
  clearAll?: boolean;
  onResetInternalFilters?: (resetFunction: () => void) => void;
}

const InternalProductsColumns: ColumnDef<Product>[] = [
  {
    accessorFn: (row) => row.serialNumber,
    header: "Serial",
    size: 80,
    meta: {
      filterVariant: "custom",
      options: (rows) => {
        const options = new Set<string>();
        rows.forEach((row) => {
          options.add(row.original.serialNumber || "No Data");
        });
        return Array.from(options);
      },
    },
    cell: ({ getValue }) => (
      <span className="font-semibold text-md">#{getValue<string>()}</span>
    ),
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      return filterValue.includes(row.getValue(columnId) || "No Data");
    },
  },
  {
    accessorFn: (row) => row.acquisitionDate,
    header: "Acquisition Date ",
    size: 100,
    meta: {
      filterVariant: "custom",
      options: (rows) => {
        const options = new Set<string>();
        rows.forEach((row) => {
          const date = row.original.acquisitionDate
            ? new Date(row.original.acquisitionDate).toLocaleDateString(
                "es-AR",
                { timeZone: "UTC" }
              )
            : "No Data";
          options.add(date);
        });
        return Array.from(options);
      },
    },
    cell: ({ getValue }) => <FormatedDate date={getValue<string>()} />,
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      const date = row.getValue(columnId)
        ? new Date(row.getValue(columnId)).toLocaleDateString("es-AR", {
            timeZone: "UTC",
          })
        : "No Data";
      return filterValue.includes(date);
    },
  },
  {
    accessorFn: (row) => row.assignedMember,
    meta: {
      filterVariant: "custom",
      options: (rows) => {
        const options = new Set<string>();
        rows.forEach((row) => {
          const assignedMember = row.original.assignedMember || "No Data";
          options.add(assignedMember);
        });
        return Array.from(options).sort();
      },
    },
    size: 150,
    header: "Currently with",
    cell: ({ getValue, row }) => <MemberName product={row.original} />,
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      const assignedMember = row.getValue(columnId) || "No Data";
      return filterValue.includes(assignedMember);
    },
  },
  {
    accessorFn: (row) => ({
      status: row.status,
      productCondition: row.productCondition as
        | "Optimal"
        | "Defective"
        | "Unusable",
    }),
    header: "Status + Product Condition",
    size: 180,
    meta: {
      filterVariant: "select",
      options: (rows) => {
        const options = new Set<string>();

        rows.forEach((row) => {
          const product = row.original as {
            status?: string;
            productCondition?: string;
          };

          const status = product.status || "No Data";
          const productCondition = product.productCondition || "Optimal";

          const combinedOption = `${status} - ${productCondition}`;

          if (status !== "Deprecated") {
            options.add(combinedOption);
          }
        });

        return Array.from(options);
      },
    },

    cell: ({ getValue }) => {
      const value = getValue<{
        status: ShipmentStatus;
        productCondition?: "Optimal" | "Defective" | "Unusable";
      }>();

      if (!value) {
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">No Data</span>
            <ProductConditionCard productCondition="Optimal" />
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <ShipmentStatusCard status={value.status} />
          <ProductConditionCard
            productCondition={value.productCondition || "Optimal"}
          />
        </div>
      );
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      const product = row.original as {
        status?: string;
        productCondition?: string;
      };

      const status = product.status || "No Data";
      const productCondition = product.productCondition || "Optimal";

      const combinedValue = `${status} - ${productCondition}`;

      if (filterValue.length === 0) return true;

      return filterValue.includes(combinedValue);
    },
  },
  {
    accessorFn: (row) => row.location,
    header: "Location",
    size: 100,
    meta: {
      filterVariant: "select",
      options: [...LOCATION] as unknown as string[],
    },
    cell: ({ getValue }) => (
      <div>
        {" "}
        <ProductLocation location={getValue<Location>()} />{" "}
      </div>
    ),
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorFn: (row) => row.status,
    header: "Actions",
    size: 100,
    cell: ({ row }) => {
      return <ActionButton product={row.original} />;
    },
    enableColumnFilter: false,
  },
  {
    id: "actiondelete",
    header: "",
    size: 85,
    cell: ({ row }) => {
      return (
        <div className="flex justify-end px-2">
          <EditProduct
            product={row.original}
            disabled={row.original.shipmentStatus === "On The Way"}
          />
          <DeleteAction
            type="product"
            id={row.original._id}
            disabled={
              row.original.status === "In Transit" ||
              row.original.status === "In Transit - Missing Data"
            }
          />
        </div>
      );
    },
  },
];
export default function ProdcutsDetailsTable({
  products,
  onClearFilters,
  clearAll,
  onResetInternalFilters,
}: IProdcutsDetailsTable) {
  const { prefetchAsset } = usePrefetchAsset();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({});
  const [key, setKey] = useState(0);
  const subTableContainerRef = useRef<HTMLDivElement | null>(null);

  const resetFilters = () => {
    setColumnFilters([]);
    setSelectedFilterOptions({});
    setKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    if (clearAll) {
      resetFilters();
    }
  }, [clearAll]);

  useEffect(() => {
    if (onResetInternalFilters) {
      onResetInternalFilters(resetFilters);
    }
  }, [onResetInternalFilters]);

  const fiteredProducts = products.filter(
    (product) => product.status !== "Deprecated"
  );

  useEffect(() => {
    const handleScroll = () => {
      setColumnFilters([]);
    };

    const tableContainer = subTableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (tableContainer) {
        tableContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div
      id="subTableContainer"
      ref={subTableContainerRef}
      className="overflow-y-auto"
    >
      <RootTable
        key={key}
        tableType="subRow"
        data={fiteredProducts}
        columns={InternalProductsColumns}
        columnFilters={columnFilters}
        onColumnFiltersChange={(newFilters) => {
          setColumnFilters(newFilters);
        }}
        onClearFilters={onClearFilters}
      />
    </div>
  );
}

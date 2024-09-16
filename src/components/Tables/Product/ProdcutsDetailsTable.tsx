import React, { useCallback, useEffect, useState } from "react";
import { RootTable } from "../RootTable";
import {
  LOCATION,
  Location,
  Product,
  PRODUCT_STATUSES,
  ShipmentStatus,
} from "@/types";
import { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import FormatedDate from "../helpers/FormatedDate";
import MemberName from "../helpers/MemberName";
import { ProductLocation, ShipmentStatusCard } from "@/common";
import { ActionButton } from "./ActionButton";
import EditProduct from "./EditProduct";
import { DeleteAction } from "@/components/Alerts";

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
      <span className="text-md font-semibold">#{getValue<string>()}</span>
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
          const assignedMember = row.original.assignedMember;
          options.add(assignedMember || "Not Assigned");
        });
        return Array.from(options);
      },
    },
    size: 200,
    header: "Currently with",
    cell: ({ getValue, row }) => <MemberName product={row.original} />,
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      const assignedMember = row.getValue(columnId) || "Not Assigned";
      return filterValue.includes(assignedMember);
    },
  },
  {
    accessorFn: (row) => row.status,
    header: "Status",
    size: 200,
    meta: {
      filterVariant: "select",
      options: PRODUCT_STATUSES.filter((status) => status !== "Deprecated"),
    },
    cell: ({ getValue }) => (
      <ShipmentStatusCard status={getValue<ShipmentStatus>()} />
    ),
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      return filterValue.includes(row.getValue(columnId));
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
    size: 85,
    cell: ({ row, getValue }) => <ActionButton product={row.original} />,
    enableColumnFilter: false,
  },
  {
    id: "actiondelete",
    header: "",
    size: 85,
    cell: ({ row }) => (
      <div className="flex justify-end px-2">
        <EditProduct product={row.original} />
        <DeleteAction type="product" id={row.original._id} />
      </div>
    ),
  },
];
export default function ProdcutsDetailsTable({
  products,
  onClearFilters,
  clearAll,
  onResetInternalFilters,
}: IProdcutsDetailsTable) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({});
  const [key, setKey] = useState(0);

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

  return (
    <RootTable
      key={key}
      tableType="subRow"
      data={fiteredProducts}
      columns={InternalProductsColumns}
      columnFilters={columnFilters}
      onColumnFiltersChange={(newFilters) => {
        console.log("Updating column filters in subtable", newFilters);
        setColumnFilters(newFilters);
      }}
      onClearFilters={onClearFilters}
    />
  );
}

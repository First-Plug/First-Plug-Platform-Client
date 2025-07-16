"use client";
import React, { useMemo } from "react";
import { Product } from "@/features/assets";
import { ShipmentStatus } from "@/features/shipments";
import { FormatedDate } from "@/shared/components/Tables";
import MemberName from "../helpers/MemberName";
import { ShipmentStatusCard } from "@/features/shipments";
import { ProductLocation } from "@/shared/components/Tables";
import EditProduct from "./EditProduct";
import { DeleteAction } from "@/shared";
import { ProductConditionCard } from "@/features/assets";
import { DataTable } from "@/features/fp-tables";
import { createFilterStore } from "@/features/fp-tables";
import { useProductsInnerTableColumns } from "./useProductsInnerTableColumns";

interface IProdcutsDetailsTable {
  products: Product[];
  onClearFilters?: () => void;
  onSubTableInstance?: (instance: any) => void;
  clearAll?: boolean;
  onResetInternalFilters?: (resetFunction: () => void) => void;
}

export default function ProdcutsDetailsTable({
  products,
}: IProdcutsDetailsTable) {
  // Crear un store de filtros específico para esta instancia de tabla
  const useProductsInnerTableFilterStore = createFilterStore();

  const filters = useProductsInnerTableFilterStore((s) => s.filters);

  // Filtrar productos basándose en los filtros aplicados
  const filteredProducts = useMemo(() => {
    let availableProducts = products.filter(
      (product) => product.status !== "Deprecated"
    );

    // Debug: mostrar filtros aplicados
    console.log("Filtros aplicados:", filters);
    console.log("Productos disponibles:", availableProducts.length);

    // Si no hay filtros aplicados, devolver todos los productos
    if (Object.keys(filters).length === 0) {
      return availableProducts;
    }

    // Aplicar filtros dinámicamente
    const filtered = availableProducts.filter((product) => {
      return Object.entries(filters).every(([column, filterValues]) => {
        if (filterValues.length === 0) return true;

        switch (column) {
          case "serialNumber":
            const serialNumber = product.serialNumber || "No Data";
            return filterValues.includes(serialNumber);

          case "acquisitionDate":
            const date = product.acquisitionDate
              ? new Date(product.acquisitionDate).toLocaleDateString("es-AR", {
                  timeZone: "UTC",
                })
              : "No Data";
            return filterValues.includes(date);

          case "assignedMember":
            const assignedMember = product.assignedMember || "No Data";
            return filterValues.includes(assignedMember);

          case "status + productCondition":
            const status = product.status || "No Data";
            const productCondition = product.productCondition || "Optimal";
            const combinedValue = `${status} - ${productCondition}`;
            return filterValues.includes(combinedValue);

          case "location":
            const location = product.location || "No Data";
            return filterValues.includes(location);

          default:
            return true;
        }
      });
    });

    console.log("Productos filtrados:", filtered.length);
    return filtered;
  }, [products, filters]);

  const columns = useProductsInnerTableColumns({ products: filteredProducts });

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={filteredProducts}
        useFilterStore={useProductsInnerTableFilterStore}
        rowHeight={50}
      />
    </div>
  );
}

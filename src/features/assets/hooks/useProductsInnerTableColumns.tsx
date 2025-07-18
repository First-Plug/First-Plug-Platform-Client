import React from "react";
import { useMemo } from "react";
import { Product } from "@/features/assets";
import { LOCATION } from "@/features/assets/interfaces/product";
import { ShipmentStatus } from "@/features/shipments";
import { FormatedDate } from "@/shared/components/Tables";
import MemberName from "@/shared/components/Tables/helpers/MemberName";
import { ShipmentStatusCard } from "@/features/shipments";
import { ProductLocation } from "@/shared/components/Tables";
import EditProduct from "@/shared/components/Tables/Product/EditProduct";
import { DeleteAction } from "@/shared";
import { ProductConditionCard } from "@/features/assets";
import { ColumnDef } from "@tanstack/react-table";
import { ActionButton } from "@/shared/components/Tables/Product";

export function useProductsInnerTableColumns({
  products,
  allProducts,
}: {
  products: Product[];
  allProducts: Product[];
}) {
  return useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "serialNumber",
        header: "Serial",
        meta: {
          hasFilter: true,
          filterOptions: (() => {
            const options = new Set<string>();
            allProducts.forEach((product) => {
              options.add(product.serialNumber || "No Data");
            });
            return Array.from(options).map((option) => ({
              label: option,
              value: option,
            }));
          })(),
        },
        cell: ({ getValue }) => (
          <span className="font-semibold text-xs">#{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "acquisitionDate",
        header: "Acquisition Date",
        size: 180,
        meta: {
          hasFilter: true,
          filterOptions: (() => {
            const options = new Set<string>();
            allProducts.forEach((product) => {
              const date = product.acquisitionDate
                ? new Date(product.acquisitionDate).toLocaleDateString(
                    "es-AR",
                    { timeZone: "UTC" }
                  )
                : "No Data";
              options.add(date);
            });
            return Array.from(options).map((option) => ({
              label: option,
              value: option,
            }));
          })(),
        },
        cell: ({ getValue }) => <FormatedDate date={getValue<string>()} />,
      },
      {
        accessorKey: "assignedMember",
        size: 250,
        header: "Currently with",
        meta: {
          hasFilter: true,
          filterOptions: (() => {
            const options = new Set<string>();
            allProducts.forEach((product) => {
              if (product.assignedMember) {
                options.add(product.assignedMember);
              }
            });
            return Array.from(options)
              .sort()
              .map((option) => ({
                label: option,
                value: option,
              }));
          })(),
        },
        cell: ({ row }) => {
          return <MemberName product={row.original} />;
        },
      },
      {
        id: "status + productCondition",
        size: 250,
        accessorFn: (row) => ({
          status: row.status,
          productCondition: row.productCondition as
            | "Optimal"
            | "Defective"
            | "Unusable",
        }),
        header: "Status + Product Condition",
        meta: {
          hasFilter: true,
          filterOptions: (() => {
            const options = new Set<string>();
            allProducts.forEach((product) => {
              const status = product.status || "No Data";
              const productCondition = product.productCondition || "Optimal";
              const combinedOption = `${status} - ${productCondition}`;
              if (status !== "Deprecated") {
                options.add(combinedOption);
              }
            });
            return Array.from(options).map((option) => ({
              label: option,
              value: option,
            }));
          })(),
        },
        cell: ({ getValue }) => {
          const value = getValue<{
            status: ShipmentStatus;
            productCondition?: "Optimal" | "Defective" | "Unusable";
          }>();

          if (!value) {
            return (
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-xs">No Data</span>
                <ProductConditionCard productCondition="Optimal" />
              </div>
            );
          }

          return (
            <div className="flex items-center gap-1">
              <ShipmentStatusCard status={value.status} />
              <ProductConditionCard
                productCondition={value.productCondition || "Optimal"}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "location",
        header: "Location",
        size: 190,
        meta: {
          hasFilter: true,
          filterOptions: [...LOCATION].map((location) => ({
            label: location,
            value: location,
          })),
        },
        cell: ({ getValue }) => (
          <ProductLocation location={getValue<string>() as any} />
        ),
      },
      {
        accessorFn: (row) => row.status,
        header: "Actions",
        size: 170,
        cell: ({ row }) => {
          return <ActionButton product={row.original} />;
        },
        enableColumnFilter: false,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          return (
            <div className="flex justify-end gap-1">
              <EditProduct product={row.original} />
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
    ],
    [products, allProducts]
  );
}

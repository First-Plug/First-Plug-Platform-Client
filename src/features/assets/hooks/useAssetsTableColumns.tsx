import React from "react";
import { useMemo } from "react";
import { Product, ProductTable } from "@/features/assets";
import { CATEGORIES } from "@/features/assets/interfaces/product";
import { ProductImage } from "@/features/assets";
import { PrdouctModelDetail } from "@/features/assets";
import { DetailsButton } from "@/shared/components/Tables";
import { ColumnDef } from "@tanstack/react-table";

export function useAssetsTableColumns({ assets }: { assets: ProductTable[] }) {
  return useMemo<ColumnDef<ProductTable>[]>(
    () => [
      {
        accessorKey: "category",
        header: "Category",
        size: 350,
        meta: {
          hasFilter: true,
          filterOptions: [...CATEGORIES].sort().map((category) => ({
            label: category,
            value: category,
          })),
        },
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 w-[150px] text-lg">
            <ProductImage category={getValue<string>()} />
            <p>{getValue<string>()}</p>
          </div>
        ),
      },
      {
        id: "name",
        accessorFn: (row) => row.products,
        header: "Name",
        meta: {
          hasFilter: true,
          filterOptions: (() => {
            const options = new Set<string>();
            const filterData: { label: string; value: string }[] = [];

            assets.forEach((row) => {
              row.products.forEach((product) => {
                const brand = product.attributes.find(
                  (attr) => attr.key === "brand"
                )?.value;
                const model = product.attributes.find(
                  (attr) => attr.key === "model"
                )?.value;
                const name = (product.name || "").trim();
                const color =
                  product.attributes.find((attr) => attr.key === "color")
                    ?.value || "";

                let label = "No Data";
                let filterValue = "No Data";

                if (product.category === "Merchandising") {
                  label = color ? `${name} (${color})` : name || "No Data";
                  filterValue = color
                    ? `${name} (${color})`
                    : name || "No Data";
                } else {
                  if (brand && model) {
                    if (model === "Other") {
                      label = `${brand} Other ${name}`.trim();
                      filterValue = `${brand} Other ${name}`.trim();
                    } else {
                      label = `${brand} ${model}`.trim();
                      filterValue = `${brand} ${model}`.trim();
                    }
                  } else {
                    label = "No Data";
                    filterValue = "No Data";
                  }
                }

                if (!options.has(label)) {
                  options.add(label);
                  filterData.push({ label, value: filterValue });
                }
              });
            });

            return filterData;
          })(),
        },
        cell: ({ row }) => (
          <PrdouctModelDetail product={row.original.products[0]} />
        ),
      },
      {
        id: "stock",
        accessorFn: (row) => row.products,
        header: "Stock",
        size: 300,
        meta: {
          hasFilter: true,
          filterOptions: (() => {
            const options = new Set<string>();
            const filterData: { label: string; value: string }[] = [];

            assets.forEach((row) => {
              const products = row.products.filter(
                (p) => p.status !== "Deprecated"
              );
              const total = products.length;
              const label = `${total} Total`;

              if (!options.has(label)) {
                options.add(label);
                filterData.push({ label, value: total.toString() });
              }
            });

            return filterData;
          })(),
        },
        cell: ({ getValue, row }) => {
          const products = getValue<Product[]>().filter(
            (product) => product.status !== "Deprecated"
          );

          // Si hay availableProducts (cuando onlyAvailable está activado), usar esos para el conteo
          const displayProducts = row.original.availableProducts || products;

          const total = products.length; // Siempre mostrar el total original
          const available = displayProducts.filter(
            (product) => product.status === "Available"
          ).length;

          return (
            <div className="flex flex-col justify-center gap-2 font-montserrat font-normal">
              <span className="flex justify-between p-1 px-2 rounded-md">
                <span>Total</span>
                <span className="flex justify-center items-center bg-lightBlue rounded-md w-6 h-6 font-semibold">
                  {total}
                </span>
              </span>
              <span className="flex justify-between p-1 px-2 rounded-md">
                <span>Available</span>
                <span className="flex justify-center items-center bg-lightGreen rounded-md w-6 h-6 font-semibold">
                  {available}
                </span>
              </span>
            </div>
          );
        },
      },
      {
        id: "expander",
        size: 130,
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? <DetailsButton row={row} /> : null;
        },
      },
    ],
    [assets]
  );
}

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
          hasFilter: false,
        },
        cell: ({ getValue }) => {
          const products = getValue<Product[]>().filter(
            (product) => product.status !== "Deprecated"
          );
          const total = products.length;
          const available = products.filter(
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
          return row.getCanExpand ? <DetailsButton row={row} /> : null;
        },
      },
    ],
    [assets]
  );
}

// Hook para las columnas de la tabla interna (productos individuales)
export function useAssetsInnerTableColumns() {
  return useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "serialNumber",
        header: "Serial",
        size: 80,
        // meta: {
        //   hasFilter: true,
        //   filterOptions: (rows: Product[]) => {
        //     const options = new Set<string>();
        //     rows.forEach((row) => {
        //       options.add(row.original.serialNumber || "No Data");
        //     });
        //     return Array.from(options).map((option) => ({
        //       label: option,
        //       value: option,
        //     }));
        //   },
        // },
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
        accessorKey: "acquisitionDate",
        header: "Acquisition Date",
        size: 100,
        // meta: {
        //   hasFilter: true,
        //   filterOptions: (rows) => {
        //     const options = new Set<string>();
        //     rows.forEach((row) => {
        //       const date = row.original.acquisitionDate
        //         ? new Date(row.original.acquisitionDate).toLocaleDateString(
        //             "es-AR",
        //             { timeZone: "UTC" }
        //           )
        //         : "No Data";
        //       options.add(date);
        //     });
        //     return Array.from(options).map((option) => ({
        //       label: option,
        //       value: option,
        //     }));
        //   },
        // },
        cell: ({ getValue }) => {
          const date = getValue<string>();
          return date
            ? new Date(date).toLocaleDateString("es-AR", { timeZone: "UTC" })
            : "No Data";
        },
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
        accessorKey: "assignedMember",
        header: "Currently with",
        size: 150,
        // meta: {
        //   hasFilter: true,
        //   filterOptions: (rows) => {
        //     const options = new Set<string>();
        //     rows.forEach((row) => {
        //       const assignedMember = row.original.assignedMember || "No Data";
        //       options.add(assignedMember);
        //     });
        //     return Array.from(options)
        //       .sort()
        //       .map((option) => ({
        //         label: option,
        //         value: option,
        //       }));
        //   },
        // },
        cell: ({ getValue }) => {
          const member = getValue<string>();
          return member ? (
            <span className="font-semibold">{member}</span>
          ) : (
            <span className="text-black">-</span>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, columnId, filterValue) => {
          if (filterValue.length === 0) return true;
          const assignedMember = row.getValue(columnId) || "No Data";
          return filterValue.includes(assignedMember);
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 100,
        // meta: {
        //   hasFilter: true,
        //   filterOptions: [
        //     "Available",
        //     "Delivered",
        //     "Unavailable",
        //     "In Transit",
        //     "In Transit - Missing Data",
        //   ].map((status) => ({
        //     label: status,
        //     value: status,
        //   })),
        // },
        cell: ({ getValue }) => {
          const status = getValue<string>();
          return (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                status === "Available"
                  ? "bg-green-100 text-green-800"
                  : status === "Delivered"
                  ? "bg-blue-100 text-blue-800"
                  : status === "Unavailable"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </span>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, columnId, filterValue) => {
          if (filterValue.length === 0) return true;
          return filterValue.includes(row.getValue(columnId));
        },
      },
      {
        accessorKey: "location",
        header: "Location",
        size: 100,
        // meta: {
        //   hasFilter: true,
        //   filterOptions: ["Employee", "Office", "Warehouse", "Unknown"].map(
        //     (location) => ({
        //       label: location,
        //       value: location,
        //     })
        //   ),
        // },
        cell: ({ getValue }) => {
          const location = getValue<string>();
          return (
            <span
              className={`p-1 px-2 text-xs rounded-md ${
                location === "Employee"
                  ? "bg-lightPurple"
                  : location === "Office"
                  ? "bg-lightGreen"
                  : "bg-light-grey"
              }`}
            >
              {location || "No Location"}
            </span>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, columnId, filterValue) => {
          if (filterValue.length === 0) return true;
          return filterValue.includes(row.getValue(columnId));
        },
      },
    ],
    []
  );
}

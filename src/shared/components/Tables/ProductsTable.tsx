import { Product, ProductTable } from "@/features/assets";
import { CATEGORIES } from "@/features/assets/interfaces/product";
import { LoaderSpinner } from "@/shared";
import { ProductImage } from "@/features/assets";
import { ColumnDef } from "@tanstack/react-table";
import { PrdouctModelDetail } from "@/features/assets";

import { RootTable } from "./RootTable";

import ProdcutsDetailsTable from "./Product/ProdcutsDetailsTable";
import "./table.css";
import { useMemo, useState, useCallback } from "react";

import { DetailsButton } from "@/shared/components/Tables";
import { useProductStore } from "@/features/assets";

interface ProductsTableProps {
  assets: ProductTable[];
  onClearFilters: () => void;
}

export const productColumns = (
  data: ProductTable[]
): ColumnDef<ProductTable>[] => [
  {
    accessorFn: (row) => row.category,
    header: "Category",
    size: 120,
    meta: {
      filterVariant: "custom",
      options: [...CATEGORIES].sort(),
    },
    cell: ({ getValue }) => (
      <div className="flex items-center gap-2 w-[150px] text-lg">
        <ProductImage category={getValue<string>()} />
        <p>{getValue<string>()}</p>
      </div>
    ),
    footer: (props) => props.column.id,
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorFn: (row) => row.products,
    header: "Name",
    size: 200,
    meta: {
      filterVariant: "custom",
      options: () => {
        const options = new Set<string>();

        data.forEach((row) => {
          row.products.forEach((product) => {
            const brand = product.attributes.find(
              (attr) => attr.key === "brand"
            )?.value;
            const model = product.attributes.find(
              (attr) => attr.key === "model"
            )?.value;
            const name = (product.name || "").trim();
            const color =
              product.attributes.find((attr) => attr.key === "color")?.value ||
              "";

            if (product.category === "Merchandising") {
              options.add(`${name} (${color})`.trim());
            } else {
              if (brand && model) {
                if (model === "Other") {
                  options.add(`${brand} Other ${name}`.trim());
                } else {
                  options.add(`${brand} ${model}`.trim());
                }
              } else {
                options.add("No Data");
              }
            }
          });
        });

        return Array.from(options);
      },
    },
    cell: ({ row }) => (
      <PrdouctModelDetail product={row.original.products[0]} />
    ),
    footer: (props) => props.column.id,
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue.length === 0) return true;

      const product = row.original.products[0];
      const brand = product.attributes.find(
        (attr) => attr.key === "brand"
      )?.value;
      const model = product.attributes.find(
        (attr) => attr.key === "model"
      )?.value;
      const name = (product.name || "").trim();
      const color =
        product.attributes.find((attr) => attr.key === "color")?.value || "";

      let groupName = "No Data";

      if (product.category === "Merchandising") {
        groupName = color ? `${name} (${color})` : name;
      } else if (brand && model) {
        groupName =
          model === "Other" ? `${brand} Other ${name}` : `${brand} ${model}`;
        groupName = groupName.trim();
      }

      return filterValue.includes(groupName);
    },
  },
  {
    accessorFn: (row) => row.products,
    header: "Stock",
    size: 80,
    enableColumnFilter: false,
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
    header: () => null,
    size: 20,
    cell: ({ row }) => {
      return row.getCanExpand() ? <DetailsButton row={row} /> : null;
    },
  },
];

export const ProductsTable = ({
  onClearFilters,
  assets,
}: ProductsTableProps) => {
  const [clearAll, setClearAll] = useState(false);
  const [resetSubTableFilters, setResetSubTableFilters] = useState<
    (() => void) | null
  >(null);

  const { onlyAvailable } = useProductStore();

  const handleClearAllFilters = useCallback(() => {
    setClearAll(true);
    if (resetSubTableFilters) {
      resetSubTableFilters();
    }

    setTimeout(() => setClearAll(false), 100);

    if (onClearFilters) {
      onClearFilters();
    }
  }, [resetSubTableFilters, onClearFilters]);

  const availableProducts = useMemo(() => {
    if (!assets) return [];

    return assets
      .map((table) => ({
        category: table.category,
        products: table.products.filter(
          (p) => p.status === "Available" && !p.deleted
        ),
      }))
      .filter((table) => table.products.length);
  }, [assets]);

  const columns = useMemo(
    () => productColumns(onlyAvailable ? availableProducts : assets),
    [onlyAvailable, availableProducts, assets]
  );

  const canExpand = useMemo(() => {
    const data = onlyAvailable ? availableProducts : assets;
    return data && data.length > 0;
  }, [onlyAvailable, availableProducts, assets]);

  return (
    <>
      {assets && assets.length > 0 ? (
        <RootTable
          tableType="stock"
          tableNameRef="productsTable"
          data={onlyAvailable ? availableProducts : assets}
          columns={columns}
          getRowCanExpand={() => canExpand}
          onClearFilters={handleClearAllFilters}
          renderSubComponent={(row) => (
            <ProdcutsDetailsTable
              products={row.products}
              clearAll={clearAll}
              onResetInternalFilters={setResetSubTableFilters}
            />
          )}
        />
      ) : (
        <LoaderSpinner />
      )}
    </>
  );
};

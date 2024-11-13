import { Product, ProductTable, CATEGORIES } from "@/types";
import { ArrowRight, Button, LoaderSpinner, ProductImage } from "@/common";
import { ColumnDef } from "@tanstack/react-table";
import PrdouctModelDetail from "@/common/PrdouctModelDetail";
import { observer } from "mobx-react-lite";
import { RootTable } from "./RootTable";
import { useStore } from "@/models";
import ProdcutsDetailsTable from "./Product/ProdcutsDetailsTable";
import "./table.css";
import { useEffect, useState } from "react";
import { autorun } from "mobx";

interface ProductsTableProps {
  assets: ProductTable[];
  onClearFilters: () => void;
  onlyAvailable: boolean;
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
      <div className="flex gap-2 text-lg items-center w-[150px]">
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
        <div className="flex flex-col gap-2 justify-center font-normal font-montserrat">
          <span className="flex justify-between rounded-md p-1 px-2">
            <span>Total</span>
            <span className="font-semibold bg-lightBlue rounded-md h-6 w-6 flex items-center justify-center">
              {total}
            </span>
          </span>
          <span className="flex justify-between shadow-sm rounded-md p-1 px-2">
            <span>Available</span>
            <span className="font-semibold bg-lightGreen rounded-md h-6 w-6 flex items-center justify-center">
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
    cell: ({ row }) =>
      row.getCanExpand() && (
        <Button
          variant="text"
          className="flex justify-end px-4 py-2 rounded-lg cursor-pointer"
          onClick={() => {
            setTimeout(() => {
              row.getToggleExpandedHandler()();
            }, 100);
          }}
        >
          <span>Details</span>
          <ArrowRight
            className={`transition-all duration-200 ${
              row.getIsExpanded() ? "rotate-[90deg]" : "rotate-[0]"
            }`}
          />
        </Button>
      ),
  },
];

export var ProductsTable = observer(function ProductsTable<ProductsTableProps>({
  onClearFilters,
  assets,
}) {
  const {
    products: { setTable, availableProducts, onlyAvaliable },
  } = useStore();
  const [clearAll, setClearAll] = useState(false);
  const [resetSubTableFilters, setResetSubTableFilters] = useState<
    (() => void) | null
  >(null);

  const handleClearAllFilters = () => {
    setClearAll(true);
    if (resetSubTableFilters) {
      resetSubTableFilters();
    }

    setTimeout(() => setClearAll(false), 100);

    if (onClearFilters) {
      onClearFilters();
    }
  };

  useEffect(() => {
    autorun(() => {
      if (assets.length) {
        setTable(assets);
      }
    });
  }, [assets, setTable]);

  const columns = productColumns(onlyAvaliable ? availableProducts : assets);

  return (
    <>
      {assets && assets.length > 0 ? (
        <RootTable
          tableType="stock"
          tableNameRef="productsTable"
          data={onlyAvaliable ? availableProducts : assets}
          columns={columns}
          getRowCanExpand={() =>
            availableProducts.length > 0 || assets.length > 0
          }
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
});

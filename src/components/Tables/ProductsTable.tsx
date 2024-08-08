import { Product, ProductTable, CATEGORIES } from "@/types";
import { ArrowRight, Button, ProductImage } from "@/common";
import { ColumnDef } from "@tanstack/react-table";
import PrdouctModelDetail from "@/common/PrdouctModelDetail";
import { observer } from "mobx-react-lite";
import { RootTable } from "./RootTable";
import { useStore } from "@/models";
import ProdcutsDetailsTable from "./Product/ProdcutsDetailsTable";
import "./table.css";

export const productColumns: ColumnDef<ProductTable>[] = [
  {
    accessorFn: (row) => row.category,
    header: "Category",
    size: 120,
    meta: {
      filterVariant: "custom",
      options: [...CATEGORIES] as unknown as string[],
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
      options: (rows) => {
        const options = new Set<string>();
        rows.forEach((row) => {
          if (row.original.category === "Merchandising") {
            options.add(row.original.products[0]?.name || "");
          } else {
            const brand = row.original.products[0]?.attributes.find(
              (attr) => attr.key === "brand"
            )?.value;
            const model = row.original.products[0]?.attributes.find(
              (attr) => attr.key === "model"
            )?.value;
            if (brand && model) {
              options.add(`${brand} ${model}`);
            }
          }
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
      if (product.category === "Merchandising") {
        return filterValue.includes(product.name);
      } else {
        const brand = product.attributes.find(
          (attr) => attr.key === "brand"
        )?.value;
        const model = product.attributes.find(
          (attr) => attr.key === "model"
        )?.value;
        return filterValue.includes(`${brand} ${model}`);
      }
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
        <div
          className="flex justify-end"
          onClick={row.getToggleExpandedHandler()}
        >
          <Button variant="text" className="p-2 rounded-lg cursor-pointer">
            <span>Details</span>
            <ArrowRight
              className={`transition-all duration-200 ${
                row.getIsExpanded() ? "rotate-[90deg]" : "rotate-[0]"
              }`}
            />
          </Button>
        </div>
      ),
  },
];

export var ProductsTable = observer(function ProductsTable() {
  const {
    products: { tableProducts, availableProducts, onlyAvaliable },
  } = useStore();

  return (
    <RootTable
      tableType="stock"
      tableNameRef="productsTable"
      data={onlyAvaliable ? availableProducts : tableProducts}
      columns={productColumns}
      getRowCanExpand={() => true}
      renderSubComponent={(row) => (
        <ProdcutsDetailsTable products={row.products} />
      )}
    />
  );
});

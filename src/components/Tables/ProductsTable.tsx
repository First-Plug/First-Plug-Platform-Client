import { Product, ProductTable } from "@/types";
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
      filterVariant: "select",
    },
    cell: ({ getValue }) => (
      <div className="flex gap-2 text-lg items-center w-[150px]">
        <ProductImage category={getValue<string>()} />
        <p>{getValue<string>()}</p>
      </div>
    ),
    footer: (props) => props.column.id,
  },
  {
    accessorFn: (row) => row.products,
    header: "Name",
    size: 200,
    cell: ({ row }) => (
      <PrdouctModelDetail product={row.original.products[0]} />
    ),
    footer: (props) => props.column.id,
  },
  {
    accessorFn: (row) => row.products,
    header: "Stock",
    size: 80,
    cell: ({ getValue }) => (
      <div className="flex flex-col gap-2 justify-center font-normal font-montserrat">
        <span className="flex justify-between rounded-md p-1 px-2">
          <span>Total</span>
          <span className="font-semibold bg-lightBlue rounded-md h-6 w-6 px-2 grid place-items-center">
            {getValue<Product[]>().length}
          </span>
        </span>
        <span className="flex justify-between shadow-sm rounded-md p-1 px-2">
          <span>Available</span>
          <span className="font-semibold bg-lightGreen rounded-md h-6 px-2 grid place-items-center">
            {
              getValue<Product[]>().filter(
                (product) => product.status === "Available"
              ).length
            }
          </span>
        </span>
      </div>
    ),
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

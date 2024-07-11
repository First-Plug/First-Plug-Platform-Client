import React from "react";
import { RootTable } from "../RootTable";
import { Location, Product, ShipmentStatus } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import FormatedDate from "../helpers/FormatedDate";
import MemberName from "../helpers/MemberName";
import { ProductLocation, ShipmentStatusCard } from "@/common";
import { ActionButton } from "./ActionButton";
import EditProduct from "./EditProduct";
import { DeleteAction } from "@/components/Alerts";
interface IProdcutsDetailsTable {
  products: Product[];
}

const InternalProductsColumns: ColumnDef<Product>[] = [
  {
    accessorFn: (row) => row.serialNumber,
    header: "Serial",
    size: 80,
    cell: ({ getValue }) => (
      <span className="text-md font-semibold">#{getValue<string>()}</span>
    ),
  },
  {
    accessorFn: (row) => row.acquisitionDate,
    header: "Acquisition Date ",
    size: 100,
    cell: ({ getValue }) => <FormatedDate date={getValue<string>()} />,
  },
  {
    accessorFn: (row) => row.assignedMember,
    meta: {
      filterVariant: "text",
    },
    size: 200,
    header: "Currently with",
    cell: ({ getValue, row }) => <MemberName product={row.original} />,
  },
  {
    accessorFn: (row) => row.status,
    header: "Status",
    size: 200,
    meta: {
      filterVariant: "select",
    },
    cell: ({ getValue }) => (
      <ShipmentStatusCard status={getValue<ShipmentStatus>()} />
    ),
  },
  {
    accessorFn: (row) => row.location,
    header: "Location",
    size: 100,
    cell: ({ getValue }) => (
      <div>
        {" "}
        <ProductLocation location={getValue<Location>()} />{" "}
      </div>
    ),
  },
  {
    accessorFn: (row) => row.status,
    header: "Actions",
    size: 85,
    cell: ({ row, getValue }) => <ActionButton product={row.original} />,
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
}: IProdcutsDetailsTable) {
  const fiteredProducts = products.filter(
    (product) => product.status !== "Deprecated"
  );
  return (
    <RootTable
      tableType="subRow"
      data={fiteredProducts}
      columns={InternalProductsColumns}
    />
  );
}

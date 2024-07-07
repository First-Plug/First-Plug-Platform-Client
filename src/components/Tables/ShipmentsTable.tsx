"use client";

import { Product, Shipment, IShipmentTable } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { DMY_Date } from "@/utils";
import { ArrowRight, Button, CustomLink } from "@/common";
import { useStore } from "@/models";
import { ProductsTable } from ".";
import { observer } from "mobx-react-lite";
import { RootTable } from "./RootTable";
const shipmentsColumns: (
  handleSelect: (shipmentId: Shipment["_id"]) => void
) => ColumnDef<IShipmentTable>[] = (handleSelect) => [
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ getValue }) => (
      <span className="uppercase text-sm"> #{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "date",
    header: "Order Date",
    cell: ({ getValue }) => DMY_Date(getValue<string>()),
  },
  {
    accessorKey: "productsQuantity",
    header: "Quantity Products",
    cell: ({ getValue }) => getValue<Product[]>(),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ getValue }) => (
      <span className="font-semibold"> {getValue<string>()} </span>
    ),
  },
  {
    accessorKey: "trackingURL",
    header: "Track",
    cell: ({ getValue }) => (
      <CustomLink href={getValue<string>()} variant="text">
        <div className="flex items-center gap-2">
          <span>Link</span>
          <ArrowRight className="w-4" />
        </div>
      </CustomLink>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ getValue }) => <span>USD {getValue<string>()}</span>,
  },
  {
    id: "expander",
    header: () => null,

    size: 2,
    cell: ({ row }) => {
      return (
        row.getCanExpand() && (
          <div
            className=" flex   "
            onClick={() => handleSelect(row.original.orderId)}
          >
            <Button
              onClick={row.getToggleExpandedHandler()}
              variant="text"
              className="p-2 rounded-lg cursor-pointer w-full "
            >
              <span>Details</span>
              <ArrowRight
                className={`transition-all duration-200 ${
                  row.getIsExpanded() ? "rotate-[90deg]" : "rotate-[0]"
                }`}
              />
            </Button>
          </div>
        )
      );
    },
  },
];
interface TableShipmentsProps {
  shipments: IShipmentTable[];
}
export const ShipmentsTable = observer(function ({
  shipments,
}: TableShipmentsProps) {
  const {
    shipments: { setSelectedShipmentId, selectedShipment },
  } = useStore();

  const handleSelectShipment = (shipmentId: Shipment["_id"]) =>
    setSelectedShipmentId(shipmentId);

  return (
    <RootTable
      tableType="shipments"
      columns={shipmentsColumns(handleSelectShipment)}
      data={shipments}
      getRowCanExpand={() => true}
      // subComponent={
      //   selectedShipment ? (
      //     <ProductsTable products={selectedShipment.products} />
      //   ) : null
      // }
    />
  );
});

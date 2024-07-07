import { Button, OrderState } from "@/common";
import { Order, OrderStatus } from "@/types";
import { DMY_Date } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";
import { useStore } from "@/models";
import { RootTable } from "./RootTable";
const ordersEquipmentColumns: (
  handleClick: (orderId: Order["_id"]) => void
) => ColumnDef<Order>[] = (handleClick) => [
  {
    accessorKey: "_id",
    header: "Order ID",
    cell: ({ getValue }) => (
      <Button
        variant="text"
        size="small"
        onClick={() => handleClick(getValue<string>())}
      >
        #{getValue<string>()}
      </Button>
    ),
  },
  {
    accessorKey: "teamMember",
    header: "Team Member",
    cell: ({ getValue }) => getValue(),
  },
  {
    accessorKey: "date",
    header: "Order Date",
    cell: ({ getValue }) => DMY_Date(getValue<string>()),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <OrderState status={getValue<OrderStatus>()} />,
  },
  {
    accessorKey: "products",
    header: "Total",
    cell: ({ getValue }) => <span>USD 1000</span>,
  },
];

interface TableEquipmentProps {
  orders: Order[];
}
export function EquipmentTable({ orders }: TableEquipmentProps) {
  const {
    orders: { setSelectedOrder },
    aside: { setAside },
  } = useStore();

  const handleClick = (orderId: Order["_id"]) => {
    setSelectedOrder(orderId);
    setAside("OrderDetails");
  };
  return (
    <RootTable
      tableType="orders"
      columns={ordersEquipmentColumns(handleClick)}
      data={orders}
    />
  );
}

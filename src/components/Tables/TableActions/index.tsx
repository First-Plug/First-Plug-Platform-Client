import { MyTeamActions } from "@/components/MyTeamActions";
import { TableType } from "@/types";
import { Table } from "@tanstack/react-table";
import TableStockActions from "./TableStockActions";

interface ITableActions<TData> {
  type: TableType;
  table: Table<TData>;
}
export function TableActions<TData>({ type, table }: ITableActions<TData>) {
  switch (type) {
    case "members":
      return <MyTeamActions table={table} />;

    case "stock":
      return <TableStockActions table={table} />;
  }
}

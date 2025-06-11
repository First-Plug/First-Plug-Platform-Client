import { MyTeamActions } from "@/features/teams";
import { TableType } from "@/shared";
import { Table } from "@tanstack/react-table";
import TableStockActions from "./TableStockActions";

interface ITableActions<TData> {
  type: TableType;
  table: Table<TData>;
  onClearAllFilters?: () => void;
}
export function TableActions<TData>({
  type,
  table,
  onClearAllFilters,
}: ITableActions<TData>) {
  switch (type) {
    case "members":
      return <MyTeamActions table={table} />;

    case "stock":
      return (
        <TableStockActions
          table={table}
          onClearAllFilters={onClearAllFilters}
        />
      );
  }
}

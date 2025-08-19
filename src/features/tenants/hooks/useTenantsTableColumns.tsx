import { ColumnDef } from "@tanstack/react-table";
import { Tenant } from "../interfaces/tenant.interface";
import { TenantsTableActions } from "../components/TenantsTableActions";
import { useMemo } from "react";
import { useTenantsTableFilterStore } from "./useTenantsTable";

interface UseTenantsTableColumnsProps {
  tenants: Tenant[];
}

export const useTenantsTableColumns = ({
  tenants,
}: UseTenantsTableColumnsProps) => {
  const filterOptions = useMemo(() => {
    const names = Array.from(
      new Set(tenants.map((tenant) => tenant.name))
    ).sort();

    const userCounts = tenants.map((tenant) => tenant.numberOfActiveUsers);
    const uniqueUserCounts = Array.from(new Set(userCounts)).sort(
      (a, b) => a - b
    );

    return {
      names: names.map((name) => ({ label: name, value: name })),
      userCounts: uniqueUserCounts.map((count) => ({
        label: count === 1 ? `${count} user` : `${count} users`,
        value: count.toString(),
      })),
    };
  }, [tenants]);

  const columns = useMemo<ColumnDef<Tenant>[]>(() => {
    const cols = [
      {
        accessorKey: "name",
        header: "Name",
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.names,
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "numberOfActiveUsers",
        header: "Number of Active Users",
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.userCounts,
        },
        cell: ({ row }) => <div>{row.getValue("numberOfActiveUsers")}</div>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const expandedRows =
            useTenantsTableFilterStore.getState().expandedRows;
          const isExpanded = expandedRows[row.original.id] || false;

          return (
            <TenantsTableActions
              tenant={row.original}
              toggleRowExpansion={() => {
                const expandedRows =
                  useTenantsTableFilterStore.getState().expandedRows;
                const currentlyExpanded =
                  expandedRows[row.original.id] || false;

                if (currentlyExpanded) {
                  useTenantsTableFilterStore.getState().setExpandedRows({
                    ...expandedRows,
                    [row.original.id]: false,
                  });
                } else {
                  useTenantsTableFilterStore.getState().setExpandedRows({
                    ...expandedRows,
                    [row.original.id]: true,
                  });
                }
              }}
              isExpanded={isExpanded}
            />
          );
        },
      },
    ];

    return cols;
  }, [tenants, filterOptions]);

  return columns;
};

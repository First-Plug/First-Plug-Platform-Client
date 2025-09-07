import { ColumnDef } from "@tanstack/react-table";
import { TenantUser } from "../interfaces/tenant.interface";

export const useTenantUsersTableColumns = (
  users: TenantUser[]
): ColumnDef<TenantUser>[] => {
  return [
    {
      accessorKey: "firstName",
      header: "Name",
      cell: ({ row }) => {
        const firstName = row.getValue("firstName") as string;
        const lastName = row.original.lastName;
        return (
          <div className="font-medium">
            {firstName} {lastName}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Assigned Email",
      cell: ({ row }) => (
        <div className="text-gray-600">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="inline-flex bg-blue-100 px-2 py-1 rounded-full font-semibold text-blue-800 text-xs">
            {row.getValue("role")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Creation Date",
      cell: ({ row }) => <div>{row.getValue("createdAt")}</div>,
    },
  ];
};

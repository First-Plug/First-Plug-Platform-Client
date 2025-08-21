"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AssignedUser } from "../interfaces/assigned-user.interface";
import { mockAssignedUsers } from "../data/mockData";
import { Badge, Button, PenIcon } from "@/shared";
import { useAsideStore } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";

interface UseAssignedUsersTableColumnsProps {
  users: AssignedUser[];
}

export const useAssignedUsersTableColumns = ({
  users,
}: UseAssignedUsersTableColumnsProps) => {
  const { setAside } = useAsideStore();
  const queryClient = useQueryClient();

  // Generar opciones de filtro dinámicamente basándose en los datos filtrados
  const filterOptions = useMemo(() => {
    const tenants = Array.from(
      new Set(
        users.map((user) =>
          user.assignedTenant === "" ? "Internal FP" : user.assignedTenant
        )
      )
    ).sort();

    const names = Array.from(new Set(users.map((user) => user.name))).sort();

    const emails = Array.from(new Set(users.map((user) => user.email))).sort();

    const roles = Array.from(new Set(users.map((user) => user.role))).sort();

    return {
      tenants: tenants.map((tenant) => ({ label: tenant, value: tenant })),
      names: names.map((name) => ({ label: name, value: name })),
      emails: emails.map((email) => ({ label: email, value: email })),
      roles: roles.map((role) => ({ label: role, value: role })),
    };
  }, [users]);

  const columns = useMemo<ColumnDef<AssignedUser>[]>(() => {
    const cols = [
      {
        accessorKey: "assignedTenant",
        header: "Assigned Tenant",
        size: 160,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.tenants,
        },
        cell: ({ getValue }) => {
          const tenant = getValue();
          const isInternalFP = tenant === "" || tenant === "Internal FP";

          return isInternalFP ? "Internal FP" : tenant;
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 180,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.names,
        },
        cell: ({ getValue }) => (
          <span className="font-semibold text-blue-500">{getValue()}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 220,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.emails,
        },
        cell: ({ getValue }) => (
          <span className="text-gray-700 text-sm">{getValue()}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 140,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.roles,
        },
        cell: ({ getValue }) => {
          const role = getValue();

          const getRoleColor = (role: string) => {
            switch (role) {
              case "Super Admin":
                return "bg-red-100 text-red-800 border border-red-200";
              case "Admin":
                return "bg-orange-100 text-orange-800 border border-orange-200";
              case "User":
                return "bg-green-100 text-green-800 border border-green-200";
              default:
                return "bg-gray-100 text-gray-800 border border-gray-200";
            }
          };

          return <Badge className={getRoleColor(role)}>{role}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        size: 80,
        cell: ({ row }) => {
          const handleEdit = () => {
            queryClient.setQueryData(["selectedAssignedUser"], row.original);
            setAside("EditAssignedUser");
          };

          return (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="hover:bg-transparent p-1"
              >
                <PenIcon
                  className="w-4 h-4 text-blue hover:text-blue/70"
                  strokeWidth={2}
                />
              </Button>
            </div>
          );
        },
      },
    ];

    return cols;
  }, [users, filterOptions, setAside, queryClient]);

  return columns;
};

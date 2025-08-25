"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button, PenIcon } from "@/shared";
import { useAsideStore } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";
import type { AssignedUser } from "../interfaces/assignedUser.interface";

interface UseAssignedUsersTableColumnsProps {
  users: any[]; // Using any for now since we're transforming the data
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

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const cols = [
      {
        accessorKey: "tenantName",
        header: "Tenant Name",
        size: 140,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.tenants,
        },
        cell: ({ getValue }) => {
          const tenantName = getValue();
          return tenantName || "N/A";
        },
      },
      {
        accessorKey: "assignedTenant",
        header: "Company Name",
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

          const getRoleLabel = (role: string) => {
            switch (role) {
              case "superadmin":
                return "Super Admin";
              case "admin":
                return "Admin";
              case "user":
                return "User";
              default:
                return role;
            }
          };

          const label = getRoleLabel(role);

          // Inline styles as fallback to ensure colors work
          const getInlineStyles = (role: string) => {
            switch (role) {
              case "superadmin":
                return {
                  backgroundColor: "#fef2f2",
                  color: "#991b1b",
                  border: "1px solid #fca5a5",
                };
              case "admin":
                return {
                  backgroundColor: "#fff7ed",
                  color: "#9a3412",
                  border: "1px solid #fdba74",
                };
              case "user":
                return {
                  backgroundColor: "#f0fdf4",
                  color: "#14532d",
                  border: "2px solid #86efac",
                };
              default:
                return {
                  backgroundColor: "#f9fafb",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                };
            }
          };

          return (
            <div
              className="px-2 py-1 rounded-full text-xs font-medium inline-block"
              style={getInlineStyles(role)}
            >
              {label}
            </div>
          );
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

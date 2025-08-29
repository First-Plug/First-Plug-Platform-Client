"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button, PenIcon } from "@/shared";
import { useAsideStore } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";

interface UseAssignedUsersTableColumnsProps {
  users: any[]; // Using any for now since we're transforming the data
}

export const useAssignedUsersTableColumns = ({
  users,
}: UseAssignedUsersTableColumnsProps) => {
  const { setAside } = useAsideStore();
  const queryClient = useQueryClient();
  const INTERNAL_LABEL = "Internal FP";
  const TENANTNAME_EMPTY_LABEL = "N/A";
  // Generar opciones de filtro dinámicamente basándose en los datos filtrados
  const filterOptions = useMemo(() => {
    const companyNames = Array.from(
      new Set(users.map((u) => u.assignedTenant || INTERNAL_LABEL))
    ).sort();

    const tenantNames = Array.from(
      new Set(users.map((u) => u.tenantName || TENANTNAME_EMPTY_LABEL))
    ).sort();

    const names = Array.from(new Set(users.map((u) => u.name))).sort();
    const emails = Array.from(new Set(users.map((u) => u.email))).sort();
    const roles = Array.from(new Set(users.map((u) => u.role))).sort();

    return {
      tenantsCompany: companyNames.map((v) => ({ label: v, value: v })),
      tenantsSlug: tenantNames.map((v) => ({ label: v, value: v })),
      names: names.map((v) => ({ label: v, value: v })),
      emails: emails.map((v) => ({ label: v, value: v })),
      roles: roles.map((v) => ({ label: v, value: v })),
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
          filterOptions: filterOptions.tenantsSlug,
        },
        cell: ({ getValue }) => {
          const tenantName = getValue();
          return tenantName || TENANTNAME_EMPTY_LABEL;
        },
      },
      {
        accessorKey: "assignedTenant",
        header: "Company Name",
        size: 160,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.tenantsCompany,
        },
        cell: ({ getValue }) => getValue() || INTERNAL_LABEL,
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
                  border: "1px solid #86efac",
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

"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UnassignedUsersTableActions } from "../components/UnassignedUsersTableActions";
import { TableDropdown } from "../components/TableDropdown";
import { useFetchTenants } from "@/features/tenants";
import { AVAILABLE_ROLES } from "../interfaces/unassignedUser.interface";

interface UseUnassignedUsersTableColumnsProps {
  users: any[]; // Using any for now since we're transforming the data
  updateUserField: (userId: string, field: string, value: string) => void;
}

export const useUnassignedUsersTableColumns = ({
  users,
  updateUserField,
}: UseUnassignedUsersTableColumnsProps) => {
  // Fetch tenants for dropdown options
  const { data: tenants } = useFetchTenants();
  // Generar opciones de filtro dinámicamente basándose en los datos filtrados
  const filterOptions = useMemo(() => {
    const dates = Array.from(
      new Set(
        users.map((user) =>
          new Date(user.creationDate).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        )
      )
    )
      .sort((a, b) => {
        const dateA = new Date(a.split("/").reverse().join("-"));
        const dateB = new Date(b.split("/").reverse().join("-"));
        return dateB.getTime() - dateA.getTime();
      })
      .map((date) => ({
        label: date,
        value: date,
      }));

    const names = Array.from(new Set(users.map((user) => user.name))).sort();

    const emails = Array.from(new Set(users.map((user) => user.email))).sort();

    const roles = Array.from(new Set(users.map((user) => user.role))).sort();

    // Prepare tenant options from real data
    const tenantOptions = tenants
      ? tenants.map((tenant) => ({
          label: tenant.tenantName, // Show tenantName (slug) instead of company name
          value: tenant.tenantName,
        }))
      : [];

    // Prepare role options
    const roleOptions = AVAILABLE_ROLES.map((role) => ({
      label: role.charAt(0).toUpperCase() + role.slice(1),
      value: role,
    }));

    return {
      dates,
      names: names.map((name) => ({ label: name, value: name })),
      emails: emails.map((email) => ({ label: email, value: email })),
      roles: roleOptions,
      tenants: tenantOptions,
    };
  }, [users, tenants]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "creationDate",
        header: "Creation Date",
        size: 150,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.dates,
        },
        cell: ({ getValue }) => {
          const date = new Date(getValue<string>());
          return (
            <span className="text-sm">
              {date.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 200,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.names,
        },
        cell: ({ getValue }) => (
          <span className="font-semibold text-blue-500">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 250,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.emails,
        },
        cell: ({ getValue }) => (
          <span className="text-gray-700 text-sm">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 180,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.roles,
        },
        cell: ({ row, getValue }) => {
          const role = getValue<string>();

          return (
            <div className="w-full">
              <TableDropdown
                options={filterOptions.roles.map((r) => r.label)}
                selectedOption={role}
                onChange={(value) => {
                  updateUserField(
                    row.original.id,
                    "role",
                    value as "Admin" | "User" | "Super Admin" | ""
                  );

                  if (value === "Super Admin") {
                    updateUserField(row.original.id, "tenant", "");
                  }
                }}
                placeholder="Select Role"
                className="w-full"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "tenant",
        header: "Tenant",
        size: 150,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.tenants,
        },
        cell: ({ row, getValue }) => {
          const tenant = getValue<string>();
          const role = row.original.role;
          const isSuperAdmin = role === "Super Admin";

          return (
            <div className="w-full">
              <TableDropdown
                options={filterOptions.tenants.map((t) => t.label)}
                selectedOption={tenant}
                onChange={(value) => {
                  updateUserField(row.original.id, "tenant", value);
                }}
                disabled={isSuperAdmin}
                placeholder="Select Tenant"
                className="w-full"
              />
            </div>
          );
        },
      },

      {
        id: "actions",
        header: "Actions",
        size: 120,
        meta: {
          hasFilter: false,
        },
        cell: ({ row }) => <UnassignedUsersTableActions user={row.original} />,
      },
    ],
    [updateUserField, filterOptions]
  );

  return columns;
};

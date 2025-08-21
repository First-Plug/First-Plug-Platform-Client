"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UnassignedUser } from "../interfaces/unassigned-user.interface";
import {
  mockUnassignedUsers,
  availableTenants,
  availableRoles,
} from "../data/mockData";
import { UnassignedUsersTableActions } from "../components/UnassignedUsersTableActions";
import { TableDropdown } from "../components/TableDropdown";

interface UseUnassignedUsersTableColumnsProps {
  users: UnassignedUser[];
  updateUserField: (
    userId: string,
    field: keyof UnassignedUser,
    value: string
  ) => void;
}

export const useUnassignedUsersTableColumns = ({
  users,
  updateUserField,
}: UseUnassignedUsersTableColumnsProps) => {
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

    const tenants = Array.from(
      new Set(users.map((user) => user.tenant))
    ).sort();

    return {
      dates,
      names: names.map((name) => ({ label: name, value: name })),
      emails: emails.map((email) => ({ label: email, value: email })),
      roles: roles.map((role) => ({ label: role, value: role })),
      tenants: tenants.map((tenant) => ({ label: tenant, value: tenant })),
    };
  }, [users]);

  const columns = useMemo<ColumnDef<UnassignedUser>[]>(
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
        size: 150,
        meta: {
          hasFilter: true,
          filterOptions: filterOptions.roles,
        },
        cell: ({ row, getValue }) => {
          const role = getValue<string>();

          return (
            <div className="w-full">
              <TableDropdown
                options={availableRoles}
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
        size: 180,
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
                options={availableTenants}
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
    [users, updateUserField, filterOptions]
  );

  return columns;
};

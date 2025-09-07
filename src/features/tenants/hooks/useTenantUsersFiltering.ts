import { useMemo } from "react";
import type { TenantUser } from "../interfaces/tenant.interface";
import type { UseBoundStore } from "zustand";

export function useTenantUsersFiltering(
  users: TenantUser[],
  useFilterStore: UseBoundStore<any>,
  tableId?: string
) {
  const getFiltersForTable = useFilterStore((s) => s.getFiltersForTable);
  const legacyFilters = useFilterStore((s) => s.filters);

  const filters = tableId ? getFiltersForTable(tableId) : legacyFilters;

  console.log("🔍 useTenantUsersFiltering - tableId:", tableId);
  console.log("🔍 useTenantUsersFiltering - filters:", filters);
  console.log("🔍 useTenantUsersFiltering - users received:", users.length);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (
      !filters ||
      Object.keys(filters as Record<string, string[]>).length === 0
    ) {
      return result;
    }

    const typedFilters = filters as Record<string, string[]>;

    // Name filter (firstName + lastName)
    const nameValues = typedFilters.firstName;
    if (nameValues && nameValues.length > 0) {
      result = result.filter((u) => {
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        return nameValues.some((v: string) =>
          fullName.includes(v.toLowerCase())
        );
      });
    }

    // Email filter
    const emailValues = typedFilters.email;
    if (emailValues && emailValues.length > 0) {
      result = result.filter((u) => emailValues.includes(u.email));
    }

    // Role filter
    const roleValues = typedFilters.role;
    if (roleValues && roleValues.length > 0) {
      result = result.filter((u) => roleValues.includes(u.role));
    }

    // CreatedAt month filter (expects values like '2024-01')
    const createdAtValues = typedFilters.createdAt;
    if (createdAtValues && createdAtValues.length > 0) {
      result = result.filter((u) => {
        const month = new Date(u.createdAt);
        const key = `${month.getFullYear()}-${String(
          month.getMonth() + 1
        ).padStart(2, "0")}`;
        return createdAtValues.includes(key);
      });
    }

    console.log("🔍 Users after filtering:", result.length);
    return result;
  }, [users, filters]);

  return { filteredUsers };
}

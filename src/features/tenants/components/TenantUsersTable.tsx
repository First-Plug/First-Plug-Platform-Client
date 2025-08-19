"use client";
import { type UseBoundStore } from "zustand";
import { DataTable } from "@/features/fp-tables";
import { useTenantUsersTableColumns } from "../hooks/useTenantUsersTableColumns";
import { TenantUser } from "../interfaces/tenant.interface";

interface Props {
  users: TenantUser[];
  useFilterStore: UseBoundStore<any>;
  tableId?: string;
}

export const TenantUsersTable = ({ users, useFilterStore, tableId }: Props) => {
  const columns = useTenantUsersTableColumns(users);

  return (
    <div className="w-full">
      <div className="bg-white">
        <DataTable
          columns={columns}
          data={users}
          useFilterStore={useFilterStore}
          tableId={tableId}
          rowHeight={50}
          adaptiveHeight={true}
          enableSnapScroll={false}
        />
      </div>
    </div>
  );
};

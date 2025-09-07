import React from "react";
import { Tenant } from "../interfaces/tenant.interface";
import { formatDate } from "@/shared/utils/dateFormat";

interface TenantDetailsTableProps {
  tenant: Tenant;
}

export const TenantDetailsTable: React.FC<TenantDetailsTableProps> = ({
  tenant,
}) => {
  return (
    <div className="col-span-full bg-gray-50 p-4 rounded-lg">
      <h4 className="mb-4 font-semibold text-gray-700">
        Users assigned to {tenant.name}
      </h4>
      <div className="overflow-x-auto">
        <table className="bg-white border border-gray-200 rounded-lg min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 border-b font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 border-b font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Assigned Email
              </th>
              <th className="px-4 py-3 border-b font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 border-b font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Creation Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tenant.users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 text-sm whitespace-nowrap">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
                  {user.email}
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
                  <span className="inline-flex bg-blue-100 px-2 py-1 rounded-full font-semibold text-blue-800 text-xs">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

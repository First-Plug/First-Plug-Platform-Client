import React from "react";
import { BuildingIcon } from "lucide-react";

export const EmptyTenants: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center py-12 text-center">
      <BuildingIcon className="mb-4 w-16 h-16 text-gray-400" />
      <h3 className="mb-2 font-medium text-gray-900 text-lg">
        No tenants found
      </h3>
      <p className="max-w-sm text-gray-500">
        There are no tenants available at the moment. Check back later or
        contact support if you need assistance.
      </p>
    </div>
  );
};

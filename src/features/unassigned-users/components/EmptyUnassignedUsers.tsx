import React from "react";
import { UsersIcon } from "lucide-react";

export const EmptyUnassignedUsers = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <UsersIcon className="w-16 h-16 mb-4 text-gray-300" />
      <h3 className="text-lg font-medium mb-2">No hay usuarios no asignados</h3>
      <p className="text-sm text-gray-400 text-center">
        No se encontraron usuarios que requieran asignación en este momento.
      </p>
    </div>
  );
};

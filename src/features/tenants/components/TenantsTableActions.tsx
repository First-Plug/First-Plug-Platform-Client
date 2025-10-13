import React from "react";
import {
  BuildingIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  UsersIcon,
} from "lucide-react";
import { Tenant } from "../interfaces/tenant.interface";
import { Button, PenIcon, useAsideStore } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useToggleTenantStatus } from "../hooks/useUpdateTenant";

interface TenantsTableActionsProps {
  tenant: Tenant;
  toggleRowExpansion: () => void;
  isExpanded: boolean;
}

export const TenantsTableActions: React.FC<TenantsTableActionsProps> = ({
  tenant,
  toggleRowExpansion,
  isExpanded,
}) => {
  const { setAside } = useAsideStore();
  const queryClient = useQueryClient();
  const toggleStatusMutation = useToggleTenantStatus();

  const handleUpdateTenant = () => {
    queryClient.setQueryData(["selectedTenant"], tenant);
    setAside("UpdateTenant");
  };

  // Función deshabilitada temporalmente
  // const handleUpdateOffice = () => {
  //   queryClient.setQueryData(["selectedTenant"], tenant);
  //   setAside("UpdateOfficeWithCards");
  // };

  const handleToggleStatus = () => {
    toggleStatusMutation.mutate({
      id: tenant.id,
      isActive: !tenant.isActive,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        icon={<PenIcon className="w-4 h-4 text-blue" strokeWidth={2} />}
        body="Update tenant"
        variant="outline"
        size="small"
        className="px-2 py-1 text-xs"
        onClick={handleUpdateTenant}
      />

      {/* Botón "Update office" deshabilitado temporalmente */}
      {/* <Button
        icon={<BuildingIcon size={16} />}
        body="Update office"
        variant="outline"
        size="small"
        className="px-2 py-1 text-xs"
        onClick={handleUpdateOffice}
      /> */}

      <Button
        icon={
          isExpanded ? (
            <ChevronUpIcon size={16} />
          ) : (
            <ChevronDownIcon size={16} />
          )
        }
        body="Details"
        variant="outline"
        size="small"
        className="px-2 py-1 text-xs"
        onClick={toggleRowExpansion}
      />
    </div>
  );
};

import React, { useState } from "react";
import { Button } from "@/shared";
import { useAssignUserToTenant } from "../hooks/useAssignUserToTenant";
import { useAlertStore } from "@/shared";
import { useFetchTenants } from "@/features/tenants";
import { GenericAlertDialog } from "@/features/assets/components/generic-alert-dialog";

interface UnassignedUsersTableActionsProps {
  user: any; // Using any for now since we're transforming the data
}

export const UnassignedUsersTableActions = ({
  user,
}: UnassignedUsersTableActionsProps) => {
  const assignUserMutation = useAssignUserToTenant();
  const { setAlert } = useAlertStore();
  const { data: tenants } = useFetchTenants();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleAssign = () => {
    // Show confirmation dialog instead of window.confirm
    setShowConfirmDialog(true);
  };

  const executeAssignment = async () => {
    setShowConfirmDialog(false);

    // Find the tenant ID from the tenant name
    const selectedTenant = tenants?.find((t) => t.tenantName === user.tenant);

    if (!selectedTenant) {
      setAlert("errorUpdateTeam");
      return;
    }

    try {
      await assignUserMutation.mutateAsync({
        userId: user.id,
        data: {
          tenantId: selectedTenant.id, // Use the actual tenant ID
          role: user.role.toLowerCase(), // Convert to lowercase for backend
        },
      });
    } catch (error) {
      setAlert("errorUpdateTeam");
    }
  };

  const isFormComplete = () => {
    if (user.role === "Superadmin") {
      return !!user.role;
    } else {
      const hasRole = !!user.role && user.role.trim() !== "";
      const hasTenant =
        !!user.tenant &&
        user.tenant.trim() !== "" &&
        user.tenant !== "Unassigned";
      return hasRole && hasTenant;
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <Button
          variant="primary"
          size="small"
          onClick={handleAssign}
          disabled={assignUserMutation.isPending || !isFormComplete()}
          className="px-3 py-1"
        >
          {assignUserMutation.isPending ? "Assigning..." : "Assign"}
        </Button>
      </div>

      <GenericAlertDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Confirmar Asignación"
        description={`El usuario <strong>${user.firstName} ${
          user.lastName
        }</strong> con email ${
          user.email
        } será asignado al rol de <strong>${user.role?.toUpperCase()}</strong> para el tenant <strong>${
          user.tenant
        }</strong>. ¿Estás seguro que los datos son correctos?`}
        isHtml={true}
        buttonText="Asignar"
        onButtonClick={executeAssignment}
        showCancelButton={true}
        cancelButtonText="Cancelar"
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
};

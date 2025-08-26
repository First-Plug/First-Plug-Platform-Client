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
    console.log("🔄 Attempting to assign user:", {
      userId: user.id,
      role: user.role,
      tenant: user.tenant,
    });

    setShowConfirmDialog(false);

    // Find the tenant ID from the tenant name
    const selectedTenant = tenants?.find((t) => t.tenantName === user.tenant);

    if (!selectedTenant) {
      console.error("❌ Tenant not found:", user.tenant);
      setAlert("errorUpdateTeam");
      return;
    }

    console.log("✅ Found tenant:", selectedTenant);

    try {
      await assignUserMutation.mutateAsync({
        userId: user.id,
        data: {
          tenantId: selectedTenant.id, // Use the actual tenant ID
          role: user.role.toLowerCase(), // Convert to lowercase for backend
        },
      });
    } catch (error) {
      console.error("Error assigning user:", error);
      setAlert("errorUpdateTeam");
    }
  };

  const isFormComplete = () => {
    console.log("🔍 Checking form completion:", {
      role: user.role,
      tenant: user.tenant,
      roleLength: user.role?.length,
      tenantLength: user.tenant?.length,
      roleType: typeof user.role,
      tenantType: typeof user.tenant,
      isSuperadmin: user.role === "Superadmin",
      fullUser: user,
    });

    if (user.role === "Superadmin") {
      const result = !!user.role;
      console.log("✅ Superadmin check result:", result);
      return result;
    } else {
      const hasRole = !!user.role && user.role.trim() !== "";
      const hasTenant =
        !!user.tenant &&
        user.tenant.trim() !== "" &&
        user.tenant !== "Unassigned";
      const result = hasRole && hasTenant;
      console.log("✅ Regular user check:", { hasRole, hasTenant, result });
      return result;
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

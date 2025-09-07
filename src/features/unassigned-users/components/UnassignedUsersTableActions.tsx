import React, { useState } from "react";
import { Button } from "@/shared";
import { useAssignUserToTenant } from "../hooks/useAssignUserToTenant";
import { useAlertStore } from "@/shared";
import { useFetchTenants } from "@/features/tenants";
import { GenericAlertDialog } from "@/features/assets/components/generic-alert-dialog";

interface UnassignedUsersTableActionsProps {
  user: any;
}

export const UnassignedUsersTableActions = ({
  user,
}: UnassignedUsersTableActionsProps) => {
  const assignUserMutation = useAssignUserToTenant();
  const { setAlert } = useAlertStore();
  const { data: tenants } = useFetchTenants();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isSuperadmin = (user.role || "").toLowerCase() === "superadmin";

  const handleAssign = () => {
    setShowConfirmDialog(true);
  };

  const executeAssignment = async () => {
    setShowConfirmDialog(false);

    const selectedTenant = tenants?.find(
      (t) => t.tenantName === user.tenant || t.name === user.tenant
    );

    if (!selectedTenant) {
      setAlert("errorUpdateUser");
      return;
    }

    try {
      await assignUserMutation.mutateAsync({
        userId: user.id,
        data: {
          role: (user.role ?? "").toLowerCase() as "user" | "admin",
          tenantId: (selectedTenant as any).id ?? (selectedTenant as any)._id,
          tenantName: selectedTenant.tenantName ?? selectedTenant.name,
        },
      });
    } catch (error) {
      setAlert("errorUpdateUser");
    }
  };

  const executeAssignmentSuperadmin = async () => {
    try {
      await assignUserMutation.mutateAsync({
        userId: user.id,
        data: { role: "superadmin" as const },
      });
      setShowConfirmDialog(false);
    } catch (error) {
      setAlert("errorUpdateUser");
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
        title={isSuperadmin ? "Warning!" : "Confirmar Asignación"}
        description={
          isSuperadmin
            ? `Estás asignando el rol de <strong>superadmin</strong> al usuario <strong>${user.firstName} ${user.lastName}</strong> , lo que le dará acceso a información sensible. ¿Estás seguro de que deseas proceder?`
            : `El usuario <strong>${user.firstName} ${
                user.lastName
              }</strong> con email ${
                user.email
              } será asignado al rol de <strong>${(
                user.role || ""
              ).toUpperCase()}</strong> para el tenant <strong>${
                user.tenant
              }</strong>. ¿Estás seguro que los datos son correctos?`
        }
        isHtml={true}
        buttonText="Asignar"
        onButtonClick={
          isSuperadmin ? executeAssignmentSuperadmin : executeAssignment
        }
        showCancelButton={true}
        cancelButtonText="Cancelar"
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
};

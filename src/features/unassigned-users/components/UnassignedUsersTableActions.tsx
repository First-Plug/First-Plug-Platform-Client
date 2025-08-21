import React from "react";
import { Button } from "@/shared";
import { UnassignedUser } from "../interfaces/unassigned-user.interface";
import { useAssignUnassignedUser } from "../hooks/useAssignUnassignedUser";

interface UnassignedUsersTableActionsProps {
  user: UnassignedUser;
}

export const UnassignedUsersTableActions = ({
  user,
}: UnassignedUsersTableActionsProps) => {
  const assignUserMutation = useAssignUnassignedUser();

  const handleAssign = async () => {
    console.log(user);
    // try {
    //   await assignUserMutation.mutateAsync({
    //     userId: user.id,
    //     tenant: user.tenant,
    //     role: user.role,
    //   });
    // } catch (error) {
    //   console.error("Error assigning user:", error);
    // }
  };

  const isFormComplete = () => {
    if (user.role === "Super Admin") {
      return !!user.role;
    } else {
      return !!(user.role && user.tenant);
    }
  };

  return (
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
  );
};

"use client";
import { useMemberStore } from "@/features/members";
import { useAsideStore } from "@/shared";

export const AsideTitle = () => {
  const { type } = useAsideStore();

  const { selectedMember } = useMemberStore();

  switch (type) {
    case "MemberDetails":
      return selectedMember
        ? `${selectedMember.firstName} ${selectedMember.lastName}`
        : "Team Member Details";
    case "EditMember":
      return "Edit Member";
    case "AssignProduct":
      return "Assign To";
    case "ReassignProduct":
      return "Reassign To";
    case "NewTeam":
      return "New Team";
    case "EditTeam":
      return `Edit Team Name & Assign Members`;
    case "LoadStock":
      return "Load Assets";
    case "LoadMembers":
      return "Load Members";
    case "OrderDetails":
      return `Order Detail `;
    case "EditProduct":
      return `Edit Product `;
    case "ChangePassword":
      return `Change Password `;
    case "UpdateShipment":
      return `Update Shipment`;
    case "EditLogisticsShipment":
      return `Edit Shipment`;
    case "EditAssignedUser":
      return `Edit Assigned User`;
  }
};

"use client";
import { useStore } from "@/models/root.store";
import { observer } from "mobx-react-lite";

export const AsideTitle = observer(function AsideTitle() {
  const { aside, orders, members } = useStore();
  const selectedMember = members.selectedMember;

  switch (aside.type) {
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
  }
});

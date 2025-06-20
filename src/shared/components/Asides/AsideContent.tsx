"use client";
import { useAsideStore } from "@/shared";

import {
  AssignProduct,
  ChangePassword,
  EditProductAside,
  EditTeamsAside,
  LoadAside,
  MemberAsideDetails,
  EditMemberAside,
  CreateTeamAside,
} from "./aside-contents";

import { ShipmentAside } from "@/features/shipments";

export var AsideContent = function () {
  const { type } = useAsideStore();
  switch (type) {
    case "MemberDetails":
      return <MemberAsideDetails />;
    case "EditTeam":
      return <EditTeamsAside />;
    case "EditMember":
      return <EditMemberAside />;
    case "EditProduct":
      return <EditProductAside />;
    case "NewTeam":
      return <CreateTeamAside />;
    case "AssignProduct":
      return <AssignProduct />;
    case "ReassignProduct":
      return <AssignProduct />;
    case "LoadStock":
      return <LoadAside />;
    case "LoadMembers":
      return <LoadAside />;
    case "ChangePassword":
      return <ChangePassword />;
    case "UpdateShipment":
      return <ShipmentAside />;
  }
};

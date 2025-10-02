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
  EditAssignedUser,
  UpdateTenant,
  UpdateOffice,
  CreateOffice,
  CreateTenant,
  CreateWarehouse,
  UpdateWarehouse,
} from "./aside-contents";

import { ShipmentAside } from "@/features/shipments";
import { EditLogisticsShipmentAside } from "@/features/logistics";

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
    case "EditLogisticsShipment":
      return <EditLogisticsShipmentAside />;
    case "EditAssignedUser":
      return <EditAssignedUser />;
    case "UpdateTenant":
      return <UpdateTenant />;
    case "UpdateOffice":
      return <UpdateOffice />;
    case "CreateOffice":
      return <CreateOffice />;
    case "CreateTenant":
      return <CreateTenant />;
    case "CreateWarehouse":
      return <CreateWarehouse />;
    case "UpdateWarehouse":
      return <UpdateWarehouse />;
  }
};

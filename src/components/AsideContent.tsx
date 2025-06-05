"use client";
import { useStore } from "@/models/root.store";
import { observer } from "mobx-react-lite";
import {
  MemberAsideDetails,
  CreateTeamAside,
  LoadAside,
  OrderAsideDetails,
} from "./";
import {
  AssignProduct,
  ChangePassword,
  EditProductAside,
  EditTeamsAside,
} from "./AsideContents";
import { EditMemberAside } from "@/features/members";
import { ShipmentAside } from "@/features/shipments";

export var AsideContent = observer(function () {
  const { aside } = useStore();
  switch (aside.type) {
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
    case "OrderDetails":
      return <OrderAsideDetails />;
    case "ChangePassword":
      return <ChangePassword />;
    case "UpdateShipment":
      return <ShipmentAside />;
  }
});

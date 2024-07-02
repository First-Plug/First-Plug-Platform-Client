"use client";
import { useStore } from "@/models/root.store";
import { observer } from "mobx-react-lite";
import {
  MemberAsideDetails,
  CreateTeamAside,
  LoadAside,
  OrderAsideDetails,
  EditTeamsAsideDetails,
} from "./";
import {
  AssignProduct,
  ChangePassword,
  EditProductAside,
  RelacoteProducts,
} from "./AsideContents";
import EditMemberAside from "./EditMemberAside";

export var AsideContent = observer(function () {
  const { aside } = useStore();
  switch (aside.type) {
    case "MemberDetails":
      return <MemberAsideDetails />;
    case "EditTeam":
      return <EditTeamsAsideDetails />;
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
  }
});

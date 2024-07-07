"use client";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models/root.store";
import { MembersTable } from "./Tables";

export var TeamMembers = observer(function TeamMembers() {
  const {
    members: { members },
  } = useStore();

  return <MembersTable members={members} />;
});

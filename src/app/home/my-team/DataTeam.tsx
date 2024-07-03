"use client";
import { BarLoader } from "@/components/Loader/BarLoader";
import { MembersTable } from "@/components/Tables";
import { useStore } from "@/models";
import { observer } from "mobx-react-lite";
export default observer(function DataTeam() {
  const {
    members: { members },
  } = useStore();
  return (
    <div className=" h-full max-h-full ">
      <MembersTable members={members} />
    </div>
  );
});

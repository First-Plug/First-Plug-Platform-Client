"use client";
import { useStore } from "@/models";
import { TeamMemberCard } from "./";
import { observer } from "mobx-react-lite";

export const GridTeam = observer(function () {
  const {
    members: { filterMembersByTeam },
  } = useStore();

  return (
    <div className="grid w-full grid-cols-4 gap-2  ">
      {filterMembersByTeam.map((member) => (
        <TeamMemberCard key={member._id} {...member} member={member} />
      ))}
    </div>
  );
});

"use client";

import { Team } from "@/types";
import { observer } from "mobx-react-lite";

interface TeamCardProps {
  team: Team;
  className?: string;
}

export var TeamCard = observer(function TeamCard({
  team,
  className,
}: TeamCardProps) {
  const teamName = team?.name || "Not Assigned";
  const teamColor = team.color ? `bg-[{team.color}]` : "bg-[#D3D3D3]";
  return (
    <span
      className={`  ${
        className || ""
      } py-0.5 px-2 rounded  text-black font-medium ${teamColor}`}
    >
      {teamName}
    </span>
  );
});

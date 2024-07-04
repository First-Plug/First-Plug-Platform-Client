"use client";

import { Team } from "@/types";
import { observer } from "mobx-react-lite";

interface TeamCardProps {
  team?: Team | string | null;
  className?: string;
}

export var TeamCard = observer(function TeamCard({
  team,
  className,
}: TeamCardProps) {
  let teamName = "Not Assigned";
  let teamColor = "#FFC6D3";

  if (typeof team === "string") {
    teamName = team;
  } else if (team && typeof team === "object") {
    teamName = team.name || "Not Assigned";
    teamColor = team.color || "#d3d3d3";
  }

  return (
    <span
      className={`py-0.5 px-2 rounded text-black font-medium ${
        className || ""
      }`}
      style={{ backgroundColor: teamColor }}
    >
      {teamName}
    </span>
  );
});

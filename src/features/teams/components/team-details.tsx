"use client";
import React from "react";
import { Button, TeamCard, DropDownArrow } from "@/shared";
import { TeamInfo } from "./team-info";
import { type Team } from "@/features/teams";

interface TeamDetailsProps {
  team: Team;
  className?: string;
  handleCheckbox: (team: Team) => void;
  handleExpandTeam: (team: Team) => void;
  isExpanded: boolean;
}

export const TeamDetails = function ({
  team,
  className,
  handleCheckbox,
  handleExpandTeam,
  isExpanded,
}: TeamDetailsProps) {
  return (
    <section className={` ${className} border border-border rounded-md px-2 `}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={() => handleCheckbox(team)}
            onClick={(e) => e.stopPropagation()}
          />
          <TeamCard team={team} />
        </div>

        <Button
          className="cursor-pointer"
          variant="outline"
          onClick={() => handleExpandTeam(team)}
        >
          <DropDownArrow
            className={`${
              isExpanded ? "rotate-180 " : " rotate-360"
            } transition-all duration-500`}
          />
        </Button>
      </div>

      {isExpanded && (
        <TeamInfo team={team} closeExpand={() => handleExpandTeam(team)} />
      )}
    </section>
  );
};

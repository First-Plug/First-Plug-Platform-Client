"use client";
import React from "react";
import { Button, TeamCard } from "@/common";
import { DropDownArrow } from "@/common/Icons";
import { TeamInfo } from ".";
import { Team, TeamMember } from "@/types";

interface TeamDetailsProps {
  team: Team;
  className?: string;
  handleCheckbox: (team: Team) => void;
  handleExpandTeam: (team: Team) => void;
  members: TeamMember[];
  isExpanded: boolean;
  setNewName: (name: string) => void;
  setSelectedMembers: (members: TeamMember[]) => void;
}

export const TeamDetails = function ({
  team,
  className,
  handleCheckbox,
  handleExpandTeam,
  members,
  isExpanded,
  setNewName,
  setSelectedMembers,
}: TeamDetailsProps) {
  return (
    <section className={` ${className} border rounded-md p-3 `}>
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <input
            type="checkbox"
            onChange={() => handleCheckbox(team)}
            onClick={(e) => e.stopPropagation()}
          />
          <TeamCard team={team} />
        </div>

        <Button
          className="cursor-pointer"
          variant="text"
          onClick={() => handleExpandTeam(team)}
        >
          <DropDownArrow
            className={`${
              isExpanded ? "rotate-180 " : " rotate-360"
            } transition-all duration-300`}
          />
        </Button>
      </div>

      {isExpanded && (
        <TeamInfo
          team={team}
          setNewName={setNewName}
          setSelectedMembers={setSelectedMembers}
        />
      )}
    </section>
  );
};

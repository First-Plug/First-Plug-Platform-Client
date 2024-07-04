"use client";
import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models/root.store";
import { TeamMember, Team } from "@/types";
import { AddMembersToTeamForm } from "./AddMembersToTeamForm";
import { transformData } from "@/utils/dataTransformUtil";

interface TeamInfoProps {
  team: Team;
  setNewName: (name: string) => void;
  setSelectedMembers: (members: TeamMember[]) => void;
  closeExpand: () => void;
}

export const TeamInfo = observer(function ({
  team,
  setNewName,
  setSelectedMembers,
  closeExpand,
}: TeamInfoProps) {
  const {
    members: { members },
    teams: { teams },
  } = useStore();

  const [newTeamName, setNewTeamName] = useState(team.name);
  const [selectedMembers, setSelectedMembersState] = useState<TeamMember[]>([]);

  useEffect(() => {
    const initialSelectedMembers = members.filter(
      (member) =>
        member.team &&
        typeof member.team === "object" &&
        member.team._id === team._id
    );
    const transformedMembers = transformData(initialSelectedMembers, teams);
    setSelectedMembersState(transformedMembers);
    setSelectedMembers(transformedMembers);
  }, [team, members, teams, setSelectedMembers]);

  const handleNewNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTeamName(e.target.value);
    setNewName(e.target.value);
  };

  const handleSelectedMembersChange = (selectedMembers: TeamMember[]) => {
    setSelectedMembersState(selectedMembers);
    setSelectedMembers(selectedMembers);
  };

  return (
    <article className="flex flex-col justify-between gap-2 w-[95%] m-auto my-2 text-md">
      <header className="flex flex-col gap-2 flex-grow">
        <span className="text-grey">Team Name</span>
        <input
          type="text"
          value={newTeamName}
          className="border-2 rounded-xl p-2 flex-grow w-full"
          onChange={handleNewNameChange}
        />
      </header>

      <hr className="my-2" />

      <AddMembersToTeamForm
        handleSelectedMembers={handleSelectedMembersChange}
        members={members}
        selectedMembers={selectedMembers}
        isEditFlow={true}
        teamId={team._id.toString()}
        closeExpand={closeExpand}
      />
    </article>
  );
});

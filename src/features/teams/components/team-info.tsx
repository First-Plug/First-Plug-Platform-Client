"use client";
import React, { useState } from "react";

import { type Team } from "@/features/teams";
import { AddMembersToTeamForm } from "./add-members-to-team-form";
import { Button, LoaderSpinner } from "@/shared";
import { TeamServices } from "@/services";
import { Input } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";

interface TeamInfoProps {
  team: Team;
  closeExpand: () => void;
}

export const TeamInfo = function ({ team, closeExpand }: TeamInfoProps) {
  const [newTeamName, setNewTeamName] = useState(team.name);
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  const handleNewNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTeamName(e.target.value);
  };

  const handleUpdateTeamName = async () => {
    setUpdating(true);
    try {
      await TeamServices.updateTeam(team._id, { ...team, name: newTeamName });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <article className="flex flex-col justify-between gap-2 m-auto my-2 w-[95%] text-md">
      <header className="flex flex-col flex-grow gap-2">
        <span className="text-grey">Team Name</span>
        <div className="relative flex items-center">
          <div className="w-full">
            <Input
              type="text"
              className="text-md"
              value={newTeamName}
              onChange={handleNewNameChange}
            />
          </div>
          <div className="right-2 absolute flex items-center">
            <Button
              variant="text"
              disabled={newTeamName === team.name || updating}
              onClick={handleUpdateTeamName}
            >
              {updating ? <LoaderSpinner /> : "save"}
            </Button>
          </div>
        </div>
      </header>

      <hr className="my-2" />

      <AddMembersToTeamForm
        isEditFlow={true}
        team={team}
        closeExpand={closeExpand}
      />
    </article>
  );
};
